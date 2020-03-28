const _ = require('lodash');
const uuid = require('uuid').v4;

const isSameDomino = (dominoA, dominoB) => {
  return (dominoA[0] === dominoB[0] && dominoA[1] === dominoB[1]) || (dominoA[1] === dominoB[0] && dominoA[0] === dominoB[1]);
};

const createDominoes = () => {
  // doulble twelve set
  // http://www.domino-games.com/domino-rules/double-twelve.html
  const dominoes = [];
  for(let i=0; i<13; i++) {
    for(let j=i; j<13; j++) {
      dominoes.push([i,j]);
    }
  }
  return dominoes;
};

const dominoesPerPlayer = {
  2: 15,
  3: 15,
  4: 15,
  5: 12,
  6: 12,
  7: 10,
  8: 10,
  9: 8,
  10: 8,
}

class Game {

  started = false;
  id = uuid();
  created_at = new Date();
  updated_at = new Date();
  currentTurn = {
    index: 0,
    placedDomino: false,
    takenFromBoneyard: false
  };
  playerOrder = [];
  hands = [];
  boneyard = [];
  trains = [];
  players = {};

  addPlayer(player) {
    this.players[player.id] = player;
  }

  getPlayer(playerId) {
    return this.players[playerId];
  }

  getPlayers() {
    return Object.values(this.players);
  }

  isCurrentPlayer(playerId) {
    return this.playerOrder[this.currentTurn.index].id === playerId;
  }

  start() {
    const players = this.getPlayers();

    if (game.started) {
      throw new Error('game has already started!');
    } else if (players.length < 2) {
      throw new Error('You need at least two players to start!');
    }

    const numberOfDominoes = dominoesPerPlayer[players.length];
    this.playerOrder = players;
    const shuffledDominoes = _.shuffle(createDominoes());

    // setup player hands
    this.hands = players.map((player) => {
      return {
        owner: player,
        dominoes: shuffledDominoes.splice(0, numberOfDominoes),
        public: false
      };
    });

    // the rest of the dominoes go in the boneyard
    this.boneyard = shuffledDominoes;

    // setup train arrays
    this.trains = players.map((player) => {
      return {
        id: uuid(),
        owner: player,
        dominoes: [],
        public: false
      };
    });

    // one shared public train
    this.trains.push({
      owner: null,
      dominoes: [],
      public: true
    });

    this.started = true;
  }

  takeDominoFromBoneYard(playerId) {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (this.currentTurn.takenFromBoneyard) {
      throw new Error('you can only take one domino from the bone yard each turn');
    }

    const hand = this.hands.find((hand) => hand.owner.id === playerId);

    // take a random domino from the boneyard
    const randomIndex = Math.round(Math.random() * (this.boneyard.length -1))
    const domino = this.boneyard.splice(randomIndex, 1);
    
    // put this domino in the player's hand
    hand.push(domino);
  }

  extendTrain({playerId, dominoes, toTrainId}) {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    const fromHand = this.hands.find((hand) => hand.owner.id === playerId);
    const toTrain = this.trains.find((train) => train.id === toTrainId);

    const dominoIndices = dominoes.map((domino) => {
      return fromHand.dominoes.findIndex((handDomino) => isSameDomino(handDomino,domino));
    });

    // make sure the player has the dominoes to remove
    const dominoDoesNotExist = dominoIndices.find((index) => index === -1);
    if (dominoDoesNotExist) {
      throw new Error(`the player does not have this domino ${dominoDoesNotExist}`);
    }

    // make sure the player can place the domino on this train
    // some trains are private to other players
    if (!toTrain.public || toTrain.owner !== fromHand.owner) {
      throw new Error('The player cannot place dominos on this private train');
    }

    // make sure the dominoes connect
    if (dominoes[0] !== toTrain.dominoes[toTrain.dominoes.length - 1][1]) {
      throw new Error('Those dominoes do not connect');
    }

    // remove dominoes from player's hand
    dominoIndices.forEach((dominoIndex) => fromHand.splice(dominoIndex, 1));
    
    // add the dominoes to the train
    toTrain.dominoes.concat(dominoes);

    // the player placed a domino on their own train
    if (toTrain.owner === fromHand.owner) {
      toTrain.public = false;
    }
  }

  endTurn() {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (!this.currentTurn.placedDomino || !this.currentTurn.takenFromBoneyard) {
      throw new Error('you must place a tile and/or take a tile from the boneyard');
    }
    const player = this.playerOrder[this.currentTurn.index];
    const playerTrain = this.trains.find((train) => train.owner.id === player.id);

    // make player train public?
    if (this.currentTurn.takenFromBoneyard && !this.currentTurn.placedDomino) {
      playerTrain.public = true;
    }

    if (this.currentTurn.index === this.playerOrder.length - 1) {
      return this.currentTurn.index = 0;
    }
    this.currentTurn.index += 1;
    this.currentTurn.takeFromBoneYard = false;
    this.currentTurn.placeDominoes = false;
  }

}

module.exports = Game;