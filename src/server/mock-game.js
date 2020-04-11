const Game = require('./game').Game;

const game = new Game({joinCode: 'TEST'});
game.id="TEST";

game.addPlayer({
  id: '123',
  name: 'test1',
  last_active: new Date()
});

game.addPlayer({
  id: '456',
  name: 'test2',
  last_active: new Date()
});


game.dominoes = [];
game.start({ centerDominoValue: 12 });
game.players['123'].scores = [{value: 12}];
game.players['456'].scores = [{value: 0}];

// game.end();

module.exports = game;