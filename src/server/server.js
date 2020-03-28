const express = require('express');
const uuid = require('uuid').v4;
const cookieSession = require('cookie-session')
var bodyParser = require('body-parser')
const Game = require('./game');

const app = express();
const PORT = process.env.PORT || 3000;

// a in-memory cache of all games
const games = {};

const sendGameState = ({game, player}, res) => {
  // update player's activity
  player.last_active = new Date();
  res.send(game);
}

const validateSession = (session) => {
  const game = games[session.gameId];
  const player = games[session.playerId];
  if (!game) {
    throw new Error('bad session: game does not exist');
  } else if (!player) {
    throw new Error('bad session: player does not exist');
  }
  return {game, player};
}

const sendGameError = (error, res) => {
  res.status(400).json({ message: error.message });
}

// static pages
app.use('/', express.static('src/client/entry'));
app.use('/join/:id', express.static('src/client/join'));
app.use('/play', express.static('src/client/play'));

// form submission
app.use(bodyParser.json());

// session management
app.use(cookieSession({
  name: 'session',
  secret: 'bananas',

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// create a game
app.post('/game', (req, res) => {  
  const game = new Game();
  games[game.id] = game;
  console.log('>>> created a game', game.id);
  res.send(game);
});

// create a player in a game
app.post('/game/:gameId/join', (req, res) => {
  const game = games[req.params.gameId];
  const name = req.body.name;
  if (!game) {
    res.status(400).json({ message: 'Game does not exist' });
    return;
  }

  if (!name) {
    res.status(400).json({ message: 'Player name not provided' });
    return;
  }

  // update/create session
  req.session.gameId = game.id;
  const playerHasId = req.session.playerId;
  if (!playerHasId) {
    req.session.playerId = uuid();
    req.session.created_at = new Date(),
    console.log(`>>> initialized session for ${name}`);
  }

  // add player to game
  const player = {
    id: req.session.playerId,
    name,
    last_active: new Date()
  };

  game.addPlayer(player);
  console.log(`>>> added ${name} to game ${game.id}`);
  sendGameState({game, player}, res);
});

// delete a game
app.delete('/game/:gameId', (req, res) => {
  delete games[req.params.gameId];
  console.log(`>>> deleted game ${game.id}`);
  res.send();
});

// read a player's game
app.get('/my/game', (req, res) => {
  try {
    const {game, player} = validateSession(req.session);
    sendGameState({game, player}, res);
  } catch (error) {
    sendGameError(error, res);
  }
});

// start a game
app.post('/my/game/start', (req, res) => { 
  try {
    const {game, player} = validateSession(req.session);
    game.start();
    console.log(`>>> started game ${game.id}`);
    sendGameState({game, player}, res);
  } catch (error) {
    sendGameError(error, res);
  }
});

// player turn action
app.post('my/game/extend-train', (req, res) => {
  try {
    const {game, player} = validateSession(req.session);
    game.extendTrain({
      playerId: player.id,
      dominoes: req.body.dominoes,
      toTrainId: req.body.trainId
    });
    console.log(`>>> extended train in game ${game.id}`);
    sendGameState({game, player}, res);
  } catch (error) {
    sendGameError(error, res);
  }
});

// player turn action
app.post('my/game/take-domino', (req, res) => {
  try {
    const {game, player} = validateSession(req.session);
    game.takeDominoFromBoneYard(player);
    console.log(`>>> took from boneyeard ${game.id}`);
    sendGameState({game, player}, res);
  } catch (error) {
    sendGameError(error, res);
  }
});

// player turn action
app.post('my/game/end-turn', (req, res) => {
  try {
    const {game, player} = validateSession(req.session);
    game.endTurn();
    console.log(`>>> ended turn ${game.id}`);
    sendGameState({game, player}, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }  
});

// debugging
app.get('/games', (req, res) => res.send(games));
app.get('/game/:gameId', (req, res) => res.send(games[req.params.gameId]));

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));