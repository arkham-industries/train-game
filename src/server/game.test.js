const Game = require('./game');

describe('Game', () => {

  let game;

  beforeEach(() => {
    game = new Game();
  });

  test('should exist', () => {
    expect(game).toBeDefined();
  });

});
