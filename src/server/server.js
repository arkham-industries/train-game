const express = require('express');
const uuid = require('uuid').v4;
const cookieSession = require('cookie-session')
var bodyParser = require('body-parser')
const Game = require('./game').Game;

const app = express();

// an in-memory cache of all games
const games = {};

const sendGameState = ({game, player}, res) => {
  // update player's activity
  player.last_active = new Date();
  res.send(game.getPlayerView(player.id));
}

const validateSession = (session) => {
  const game = games[session.gameId];
  const player = game.players[session.playerId];
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

const createUniqueJoinCode = () => {
  // https://stackoverflow.com/a/38622545
  const code = Math.random().toString(36).substr(2, 5).toUpperCase();
  const existingCode = Object.values(games).some((game) => game.joinCode === code);
  return existingCode ? createUniqueJoinCode() : code;
};


// static pages
app.use('/assets', express.static('src/client/assets'));
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
  const joinCode = createUniqueJoinCode(); 
  const game = new Game({joinCode});
  games[game.id] = game;
  console.log('>>> created a game', game.id);
  res.send(game);
});

// create a player in a game
app.post('/game/:joinCode/join', (req, res) => {
  const game = Object.values(games).find((game) => game.joinCode === req.params.joinCode);
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
    // try to start the game
    game.start();
    // the game started, free up the join code
    delete game.joinCode;
    console.log(`>>> started game ${game.id}`);
    sendGameState({game, player}, res);
  } catch (error) {
    sendGameError(error, res);
  }
});

// player turn action
app.post('/my/game/extend-train', (req, res) => {
  try {
    const {game, player} = validateSession(req.session);
    game.extendTrain({
      playerId: player.id,
      domino: req.body.domino,
      toTrainId: req.body.trainId
    });
    console.log(`>>> extended train in game ${game.id}`);
    sendGameState({game, player}, res);
  } catch (error) {
    sendGameError(error, res);
  }
});

// player turn action
app.post('/my/game/take-domino', (req, res) => {
  try {
    const {game, player} = validateSession(req.session);
    game.takeDominoFromBoneYard(player.id);
    console.log(`>>> took from boneyeard ${game.id}`);
    sendGameState({game, player}, res);
  } catch (error) {
    sendGameError(error, res);
  }
});

// player turn action
app.post('/my/game/end-turn', (req, res) => {
  try {
    const {game, player} = validateSession(req.session);
    game.endTurn(player.id);
    console.log(`>>> ended turn ${game.id}`);
    sendGameState({game, player}, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }  
});

// debugging
app.get('/games', (req, res) => res.send(games));
app.get('/game/:gameId', (req, res) => res.send(games[req.params.gameId]));

module.exports = {app, games};