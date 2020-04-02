const gameExports = require('./game');
const Game = gameExports.Game;

const mockPlayers = [
  {
    id: '123',
    name: 'testo',
    last_active: new Date()
  },
  {
    id: '456',
    name: 'testo2',
    last_active: new Date()
  }
];

const setupGame = (game) => {
  game.addPlayer(mockPlayers[0]);
  game.addPlayer(mockPlayers[1]);
  game.start({ centerDominoValue: 12 });
};

describe('Game', () => {

  let game;

  beforeEach(() => {
    game = new Game();
  });

  it('should exist', () => {
    expect(game).toBeDefined();
  });

  describe('start', () => {

    it('should have a start method',  () => {
      expect(game.start).toBeDefined();
    });

    it('should throw an error if there are less than two players',  () => {
      // zero player should throw
      expect(() => game.start({ centerDominoValue: 12 })).toThrow();

      // one player should throw
      game.addPlayer(mockPlayers[0]);
      expect(() => game.start({ centerDominoValue: 12 })).toThrow();

      // two players should not throw
      game.addPlayer(mockPlayers[1]);
      expect(() => game.start({ centerDominoValue: 12 })).toBeDefined();
    });

    it('should throw an error if a game is started when it has already started',  () => {
      game.addPlayer(mockPlayers[0]);
      game.addPlayer(mockPlayers[1]);
      game.start({ centerDominoValue: 12 });
      expect(() => game.start({ centerDominoValue: 12 })).toThrow();
    });

    it('should setup a game',  () => {
      const centerDominoValue = 12;
      game.addPlayer(mockPlayers[0]);
      game.addPlayer(mockPlayers[1]);
      game.start({centerDominoValue});
      expect(game.playerOrder.length).toBe(2);
      expect(game.trains.length).toBe(3);
      expect(game.boneyard.length).toBeGreaterThan(0);
      expect(Object.keys(game.hands).length).toBe(2);
      expect(game.started).toBe(true);
      expect(game.centerDominoValue).toEqual(centerDominoValue);
      expect(game.isCurrentPlayer(mockPlayers[0].id)).toBe(true);
    });
  });

  describe('takeDominoFromBoneYard', () => {
    it('should have a takeDominoFromBoneYard method',  () => {
      expect(game.takeDominoFromBoneYard).toBeDefined()
    });

    it('should only allow the active player to take from boneyard',  () => {
      setupGame(game);
      expect(() => game.takeDominoFromBoneYard(mockPlayers[1].id)).toThrow();
      expect(() => game.takeDominoFromBoneYard(mockPlayers[0].id)).toBeDefined();
    });

    it('should allow the active player to take from boneyard once',  () => {
      setupGame(game);
      game.takeDominoFromBoneYard(mockPlayers[0].id);
      expect(() => game.takeDominoFromBoneYard(mockPlayers[0].id)).toThrow();
    });

    it('should remove a domino from the boneyard and put it in the player\'s hand',  () => {
      setupGame(game);
      const boneyardLength = game.boneyard.length;
      const playerDominoes = game.hands[mockPlayers[0].id].dominoes;
      const handLength = playerDominoes.length;
      game.takeDominoFromBoneYard(mockPlayers[0].id);
      expect(playerDominoes.length - handLength).toBe(1);
      expect(game.boneyard.length - boneyardLength).toBe(-1);
      expect(game.boneyard).not.toContain(playerDominoes[playerDominoes.length - 1]);
    });
  });

  describe('extendTrain', () => {
    it('should have a extendTrain method',  () => {
      expect(game.extendTrain).toBeDefined();
    });

    it('should only allow the active player to extend a train',  () => {
      setupGame(game);
      const playerId = mockPlayers[1].id;
      const dominoes = [game.hands[playerId].dominoes[0]];
      const toTrainId = game.trains[0].id;
      
      expect(() => game.extendTrain({playerId, dominoes, toTrainId})).toThrow();
    });

    it('should not allow a player to use dominoes they don\'t have',  () => {
      setupGame(game);
      const playerId = mockPlayers[1].id;
      const dominoes = [[13,13]];
      const toTrainId = game.trains[0].id;
      
      expect(() => game.extendTrain({playerId, dominoes, toTrainId})).toThrow();
    });

    it('should not allow a player to place dominoes on private trains',  () => {
      setupGame(game);
      const playerId = mockPlayers[1].id;
      const dominoes = game.hands[playerId][0];
      const toTrainId = game.trains[1].id;
      
      expect(() => game.extendTrain({playerId, dominoes, toTrainId})).toThrow();
    });

    it('should not allow a player to place dominoes that do not connect',  () => {
      setupGame(game);
      const domino = [1,1];
      const playerId = mockPlayers[0].id;
      game.hands[playerId].dominoes.push(domino);
      const dominoes = [domino];
      const toTrainId = game.trains[0].id;
      
      expect(() => game.extendTrain({playerId, dominoes, toTrainId})).toThrow();
    });

    it('should allow a player to place a domino that does connect',  () => {
      setupGame(game);
      const domino = [1,12];
      const playerId = mockPlayers[0].id;
      game.hands[playerId].dominoes.push(domino);
      const playerHandLength = game.hands[playerId].dominoes.length;
      const dominoes = [domino];
      const toTrainId = game.trains[0].id;
      game.extendTrain({playerId, dominoes, toTrainId});
      expect(game.trains[0].public).toBe(false);
      expect(game.trains[0].dominoes.length).toBe(2);
      expect(game.hands[playerId].dominoes.length - playerHandLength).toBe(-1);
    });

    it('should allow a player to place a domino that is reversed',  () => {
      setupGame(game);
      const domino = [12,1];
      const playerId = mockPlayers[0].id;
      game.hands[playerId].dominoes.push(domino);
      const playerHandLength = game.hands[playerId].dominoes.length;
      const dominoes = [domino];
      const toTrainId = game.trains[0].id;
      game.extendTrain({playerId, dominoes, toTrainId});
      expect(game.trains[0].public).toBe(false);
      expect(game.trains[0].dominoes.length).toBe(2);
      expect(game.hands[playerId].dominoes.length - playerHandLength).toBe(-1);
    });

    it('should allow a player to place dominoes only once per turn',  () => {
      setupGame(game);
      const domino = [1,12];
      const playerId = mockPlayers[0].id;
      game.hands[playerId].dominoes.push(domino);
      const dominoes = [domino];
      const toTrainId = game.trains[0].id;
      game.extendTrain({playerId, dominoes, toTrainId});
      expect(() => game.extendTrain({playerId, dominoes, toTrainId})).toThrow();
    });
  });

  describe('endTurn', () => {
    it('should have a endTurn method',  () => {
      expect(game.endTurn).toBeDefined();
    });

    it('should only allow the active player to end a turn',  () => {
      setupGame(game);
      const playerId = mockPlayers[1].id;
      expect(() => game.endTurn(playerId)).toThrow();
    });

    it('should not allow a player to end a turn if they haven\'t placed or taken a domino',  () => {
      setupGame(game);
      const playerId = mockPlayers[0].id;
      expect(() => game.endTurn(playerId)).toThrow();
    });

    it('should set the currentTurn to the next player',  () => {
      setupGame(game);
      const playerId = mockPlayers[0].id;
      game.takeDominoFromBoneYard(playerId);
      game.endTurn(playerId);
      expect(game.currentTurn.index).toBe(1);
      expect(game.currentTurn.placedDomino).toBe(false);
      expect(game.currentTurn.takenFromBoneYard).toBe(false);
    });

    it('should make the player\'s train public if they don\'t place a domino',  () => {
      setupGame(game);
      const playerId = mockPlayers[0].id;
      game.takeDominoFromBoneYard(playerId);
      expect(game.trains[0].public).toBe(false);
      game.endTurn(playerId);
      expect(game.trains[0].public).toBe(true);
    });

    it('should not make the player\'s train public if they do place a domino', () => {
      setupGame(game);
      const domino = [1,12];
      const playerId = mockPlayers[0].id;
      game.hands[playerId].dominoes.push(domino);
      const dominoes = [domino];
      const toTrainId = game.trains[0].id;
      game.takeDominoFromBoneYard(playerId);
      game.extendTrain({playerId, dominoes, toTrainId});
      game.endTurn(playerId);
      expect(game.trains[0].public).toBe(false);
    })
  });

});
