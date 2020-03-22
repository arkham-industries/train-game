const express = require('express');
const uuid = require('uuid').v4;
const cookieSession = require('cookie-session')
var bodyParser = require('body-parser')

const app = express();
const port = 3000;

// a in-memory cache of all games
const games = {};

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

// debugging
app.get('/games', (req, res) => res.send(games));
app.get('/game/:gameId', (req, res) => res.send(games[req.params.gameId]));

// delete a game
app.delete('/game/:gameId', (req, res) => {
  delete games[req.params.gameId];
  res.send();
});

// read a player's game
app.get('/my/game', (req, res) => {
  const game = games[req.session.gameId];
  if (!game) {
    res.status(400).json({ message: 'Game does not exist' });
    return;
  }
  const player = game.players[req.session.playerId];

  if (!player) {
    res.status(400).json({ message: 'Player has not joined game' });
    return;
  }

  // update player's activity
  player.last_active = new Date();
  res.send(game);  
});

// create a game
app.post('/game', (req, res) => {  
  const gameId = uuid();
  const game = {
    id: gameId,
    created_at: new Date(),
    updated_at: new Date(),
    players: {},
    gameState: {}
  };

  games[gameId] = game;

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
  const isExistingPlayer = game.players[req.session.playerId];
  if (!isExistingPlayer) {
    // add player to game
    game.players[req.session.playerId] = {
      id: req.session.playerId,
      name,
      last_active: new Date()
    };
    console.log(`>>> added ${name} to game ${game.id}`);
  }
  
  // no data needed to return here, just
  // a 200 indicating the join was succussful
  res.send();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));