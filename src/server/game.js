const _ = require('lodash');
const uuid = require('uuid').v4;

const isSameDomino = (dominoA, dominoB) => {
  return (dominoA[0] === dominoB[0] && dominoA[1] === dominoB[1]) || (dominoA[1] === dominoB[0] && dominoA[0] === dominoB[1]);
};

const createDominoes = (centerDominoValue) => {
  // double twelve set (minus center domino)
  // http://www.domino-games.com/domino-rules/double-twelve.html
  const dominoes = [];
  for(let i=0; i<13; i++) {
    for(let j=i; j<13; j++) {
      if (i === centerDominoValue && j === centerDominoValue) {
        // skip the center domino value in the set
        continue;
      }
      dominoes.push([i,j]);
    }
  }
  return dominoes;
};

const dominoesConnect = (dominoA, dominoB) => {
  return dominoA[1] === dominoB[0];
};

const rotateDomino = (domino) => {
  return [domino[1], domino[0]];
}

const connectDominoes = (dominoes) => {
  return dominoes.map((domino, i) => {
    const previousDomino = dominoes[i-1];
    const rotatedDomino = rotateDomino(domino);
    if (!previousDomino) {
      return domino;
    } else {
      if (dominoesConnect(previousDomino, domino)) {
        return domino;
      } else if (dominoesConnect(previousDomino, rotatedDomino)) {
        return rotatedDomino;
      } else {
        throw new Error(`domino ${previousDomino} does not connect to ${domino}`);
      }
    } 
  });
}


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
    takenFromBoneYard: false
  };
  centerDominoValue = null;
  playerOrder = [];
  boneyard = [];
  trains = [];
  players = {};
  hands = {};

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
    return this.playerOrder.length ? this.playerOrder[this.currentTurn.index].id === playerId : false;
  }

  start({ centerDominoValue }) {
    const players = this.getPlayers();
    const numberOfDominoes = dominoesPerPlayer[players.length];

    if (this.started) {
      throw new Error('game has already started!');
    } else if (players.length < 2) {
      throw new Error('You need at least two players to start!');
    }
    
    this.playerOrder = players;
    this.centerDominoValue = centerDominoValue;
    
    const shuffledDominoes = _.shuffle(createDominoes(centerDominoValue));

    // setup player hands
    players.forEach((player) => {
      this.hands[player.id] = {
        owner: player,
        dominoes: shuffledDominoes.splice(0, numberOfDominoes)
      };
    });

    // the rest of the dominoes go in the boneyard
    this.boneyard = shuffledDominoes;

    // setup train arrays
    this.trains = players.map((player) => {
      return {
        id: uuid(),
        owner: player,
        dominoes: [[centerDominoValue, centerDominoValue]],
        public: false
      };
    });

    // one shared public train
    this.trains.push({
      id: uuid(),
      owner: null,
      dominoes: [[centerDominoValue, centerDominoValue]],
      public: true
    });

    this.started = true;
  }

  takeDominoFromBoneYard(playerId) {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (this.currentTurn.takenFromBoneYard) {
      throw new Error('you can only take one domino from the bone yard each turn');
    }

    if (this.currentTurn.placedDomino) {
      throw new Error('you cannot take from the boneyard once a domino was placed');
    }

    const hand = this.hands[playerId];

    // take a random domino from the boneyard
    const randomIndex = Math.round(Math.random() * (this.boneyard.length -1))
    const domino = this.boneyard.splice(randomIndex, 1)[0];
    
    // put this domino in the player's hand
    hand.dominoes.push(domino);

    this.currentTurn.takenFromBoneYard = true;
  }

  extendTrain({playerId, dominoes, toTrainId}) {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (this.currentTurn.placedDomino) {
      throw new Error('you have already placed dominoes');
    }

    const fromHand = this.hands[playerId];
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
    if (!toTrain.public && toTrain.owner.id !== fromHand.owner.id) {
      throw new Error('The player cannot place dominos on this private train');
    }

    // make sure the dominoes connect
    // this will throw an error if it fails
    const connectedDominoes = connectDominoes(toTrain.dominoes.concat(dominoes));

    // All error throwing is above.
    // Now, move the domino from the players hand.

    // remove dominoes from player's hand
    dominoIndices.forEach((dominoIndex) => fromHand.dominoes.splice(dominoIndex, 1));
    // add the dominoes to the train
    toTrain.dominoes = connectedDominoes;
    // the player placed a domino on their own train
    if (toTrain.owner === fromHand.owner) {
      toTrain.public = false;
    }
    // indicate the player placed a domino
    this.currentTurn.placedDomino = true;
  }

  endTurn(playerId) {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (!this.currentTurn.placedDomino && !this.currentTurn.takenFromBoneYard) {
      throw new Error('you must place a tile and/or take a tile from the boneyard');
    }

    const player = this.playerOrder[this.currentTurn.index];
    const playerTrain = this.trains.find((train) => train.owner.id === player.id);

    // make player train public?
    if (this.currentTurn.takenFromBoneYard && !this.currentTurn.placedDomino) {
      playerTrain.public = true;
    }

    if (this.currentTurn.index === this.playerOrder.length - 1) {
      this.currentTurn.index = 0;
    } else {
      this.currentTurn.index += 1;
    }

    this.currentTurn.takenFromBoneYard = false;
    this.currentTurn.placedDomino = false;
  }

  getPlayerView(playerId) {
    return {
      id: this.id,
      started: this.started,
      playerOrder: this.playerOrder,
      boneyard: this.boneyard,
      trains: this.trains,
      hand: this.hands[playerId] && this.hands[playerId].dominoes,
      centerDominoValue: this.centerDominoValue,
      currentTurn: this.currentTurn,
      myTurn: this.isCurrentPlayer(playerId)
    };
  }
}

module.exports = { Game, createDominoes, isSameDomino };