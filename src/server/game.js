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

  started = null;
  ended = null;
  id = uuid();
  joinCode = null;
  created_at = new Date();
  updated_at = new Date();
  roundCount = 0;
  currentTurn = null;
  gamesPlayed = 0;
  turnsPassed = 0;
  centerDominoValue = null;
  openDoubleValue = null;
  playerOrder = [];
  boneyard = [];
  trains = [];
  players = {};
  hands = {};

  constructor({joinCode}) {
    if (!joinCode) { throw new Error('a join code must be provided to create a game'); }
    this.joinCode = joinCode;
  }

  addPlayer(player) {
    player.scores = [];
    this.players[player.id] = player;
    this.playerOrder = this.getPlayers();
  }

  getPlayer(playerId) {
    return this.players[playerId];
  }

  getPlayers() {
    return Object.values(this.players);
  }

  isCurrentPlayer(playerId) {
    const currentPlayer = this.playerOrder.length && this.currentTurn && this.playerOrder[this.currentTurn.index];
    return currentPlayer ? currentPlayer.id === playerId : false;
  }

  updateCenterDominoValue() {
    if (this.centerDominoValue === null) {
      this.centerDominoValue = 12;
    } else if (this.centerDominoValue === 0) {
      throw new Error('center domino value at zero!');
    } else {
      this.centerDominoValue -= 1;
    }
  }

  start() {
   
    if (this.started && !this.ended) {
      throw new Error('game is currently in progress!');
    } else if (this.playerOrder.length < 2) {
      throw new Error('You need at least two players to start!');
    }

    // try to update center domino value
    this.updateCenterDominoValue();

    // reset things
    this.started = true;
    this.ended = false;
    this.openDoubleValue = null;
    this.roundCount = 0;
    this.currentTurn = {
      index: 0,
      extendedTrainId: null,
      takenFromBoneYard: false,
      playedDouble: false,
      dominoesPlayed: 0
    };

    const shuffledDominoes = _.shuffle(createDominoes(this.centerDominoValue));
    const numberOfDominoes = dominoesPerPlayer[this.playerOrder.length];

    // shift player order
    if (this.gamesPlayed > 0) {
      this.playerOrder = this.playerOrder.map((player, i) => {
        if (this.playerOrder[i+1]) {
          return this.playerOrder[i+1];
        } else {
          return this.playerOrder[0];
        }
      });
    };

    // setup player hands
    this.playerOrder.forEach((player) => {
      this.hands[player.id] = {
        owner: player,
        dominoes: shuffledDominoes.splice(0, numberOfDominoes)
      };
    });

    // the rest of the dominoes go in the boneyard
    this.boneyard = shuffledDominoes;

    // setup train arrays
    this.trains = this.playerOrder.map((player) => {
      return {
        id: uuid(),
        owner: player,
        dominoes: [[this.centerDominoValue, this.centerDominoValue]],
        public: false
      };
    });

    // one shared public train
    this.trains.push({
      id: uuid(),
      owner: null,
      dominoes: [[this.centerDominoValue, this.centerDominoValue]],
      public: true
    });

  }

  takeDominoFromBoneYard(playerId) {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (this.ended) {
      throw new Error('This game has ended.');
    }

    if (this.currentTurn.takenFromBoneYard) {
      throw new Error('you can only take one domino from the bone yard each turn');
    }

    if (this.currentTurn.extendedTrainId && this.openDoubleValue === null) {
      throw new Error('you cannot take from the boneyard once a domino was placed');
    } 

    if (this.boneyard.length === 0) {
      throw new Error('there are no more dominoes in the boneyard');
    }

    const hand = this.hands[playerId];

    // take a random domino from the boneyard
    const randomIndex = Math.round(Math.random() * (this.boneyard.length -1))
    const domino = this.boneyard.splice(randomIndex, 1)[0];
    
    // put this domino in the player's hand
    hand.dominoes.push(domino);

    this.currentTurn.takenFromBoneYard = true;
  }

  extendTrain({playerId, domino, toTrainId}) {

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (this.ended) {
      throw new Error('This game has ended.');
    }

    const fromHand = this.hands[playerId];
    const toTrain = this.trains.find((train) => train.id === toTrainId);
    const extendingSameTrain = this.currentTurn.extendedTrainId === toTrainId;
    const connectingDomino = toTrain.dominoes[toTrain.dominoes.length - 1];
    const connectingDominoIsOpenDouble = this.openDoubleValue === connectingDomino[0] && this.openDoubleValue === connectingDomino[1];

    if (this.currentTurn.extendedTrainId) {
      // the player is attemping to place a second domino
      if (this.roundCount > 0) {
        if (this.currentTurn.playedDouble) {
          // a player can play only one more domino on the same train
          if (!extendingSameTrain) {
            throw new Error('you can only extend the same train after playing a double');
          }
          if (this.currentTurn.dominoesPlayed > 1) {
            throw new Error('you can only play one domino after playing a double');
          }
        } else {  
          throw new Error('you can only place muliple dominoes on the first turn, unless you play a double');
        }
      } else {
        // it is the first turn
        if (!extendingSameTrain) {
          throw new Error('you can only extend the same train on the first turn');
        }
      }
    } else {
      // the player is placing their fist domino
      if (this.roundCount > 0) {
        if (this.openDoubleValue !== null) {
          if (!connectingDominoIsOpenDouble) {
            throw new Error('you must play on the open double');
          }
        }
      } else {
        if (!toTrain.owner || toTrain.owner.id !== fromHand.owner.id) {
          throw new Error('you can only extend your own train on the first turn');
        }
      }
    }

    const dominoIndex = fromHand.dominoes.findIndex((handDomino) => isSameDomino(handDomino,domino));

    // make sure the player has the dominoes to remove
    if (dominoIndex === -1) {
      throw new Error(`the player does not have this domino ${dominoDoesNotExist}`);
    }

    // make sure the player can place the domino on this train
    // some trains are private to other players
    const playingOnPrivateTrain = !toTrain.public && toTrain.owner.id !== fromHand.owner.id;
    const playingOnOpenDouble = this.openDoubleValue !== null && connectingDominoIsOpenDouble;
    if (!playingOnOpenDouble && playingOnPrivateTrain) {
      throw new Error('The player cannot place dominos on this private train');
    }

    // make sure the dominoes connect
    // this will throw an error if it fails
    const connectedDominoes = connectDominoes(toTrain.dominoes.concat([domino]));

    // All error throwing is above.
    // Now, move the domino from the players hand.

    // remove dominoes from player's hand
    fromHand.dominoes.splice(dominoIndex, 1);
    // add the dominoes to the train
    toTrain.dominoes = connectedDominoes;
    // the player placed a domino on their own train
    if (toTrain.owner === fromHand.owner) {
      toTrain.public = false;
    }

    if (domino[0] === domino[1]) {
      this.currentTurn.playedDouble = true;  
      this.openDoubleValue = domino[0];
    } else {
      this.openDoubleValue = null;
    }
    

    // indicate the player placed a domino
    this.currentTurn.extendedTrainId = toTrainId;
    this.currentTurn.dominoesPlayed += 1;
  }

  endTurn(playerId) {
    const canTakeDomino = this.boneyard.length > 0;

    // make sure it is the player's turn
    if (!this.isCurrentPlayer(playerId)) {
      throw new Error('It\'s not your turn');
    }

    if (this.ended) {
      throw new Error('This game has ended.');
    }

    if (!this.currentTurn.extendedTrainId && (!this.currentTurn.takenFromBoneYard && canTakeDomino)) {
      throw new Error('you must place a tile and/or take a tile from the boneyard');
    }

    if (this.openDoubleValue !== null && !this.currentTurn.takenFromBoneYard) {
      throw new Error('you must take from boneyard when an open double is present');
    }

    const player = this.playerOrder[this.currentTurn.index];
    const playerTrain = this.trains.find((train) => train.owner.id === player.id);

    // make player train public?
    if (this.currentTurn.playedDouble) {
      // the player has played a double
      if (this.currentTurn.dominoesPlayed !== 2) {
        // the player failed to satisfy their double
        playerTrain.public = true;
      }
    } else {
      // the player has not played a double this turn
      if (this.openDoubleValue === null) {
        // no open double to satisfy
        if (this.currentTurn.takenFromBoneYard && !this.currentTurn.extendedTrainId) {
          playerTrain.public = true;
        }
      }
      // else, there is an open double from another player, no public train penalty for not satisfying it
    }

    // check end of game conditions
    const fromHand = this.hands[playerId];
    if (fromHand.dominoes.length === 0) {
      this.end();
    }

    // tally the consecutive turns passed
    console.log('?', this.currentTurn.extendedTrainId, canTakeDomino);
    const passedTurn = !this.currentTurn.extendedTrainId && !canTakeDomino;
    if (passedTurn) {
      this.turnsPassed += 1;
    } else {
      this.turnsPassed = 0;
    }

    // check to see if everyone passed
    if (this.turnsPassed === this.playerOrder.length) {
      this.end();
    }
    
    // set turn data
    if (this.currentTurn.index === this.playerOrder.length - 1) {
      this.currentTurn.index = 0;
      this.roundCount += 1;
    } else {
      this.currentTurn.index += 1;
    }
    this.currentTurn.takenFromBoneYard = false;
    this.currentTurn.extendedTrainId = null;
    this.currentTurn.playedDouble = false;
    this.currentTurn.dominoesPlayed = 0;

  }

  getPlayerView(playerId) {
    return {
      joinCode: this.joinCode,
      myPlayerId: playerId, 
      started: this.started,
      playerOrder: this.playerOrder,
      boneyardSize: this.boneyard.length,
      trains: this.trains,
      hand: this.hands[playerId] && this.hands[playerId].dominoes,
      centerDominoValue: this.centerDominoValue,
      currentTurn: this.currentTurn,
      myTurn: this.isCurrentPlayer(playerId),
      openDoubleValue: this.openDoubleValue,
      playerSizes: this.playerOrder.map(({id}) => this.hands[id] ? this.hands[id].dominoes.length : 0),
      ended: this.ended
    };
  }

  end() {
    this.ended = true;
    this.gamesPlayed += 1;
    this.currentTurn.index = -1;
    // tally scores
    this.playerOrder.forEach((player) => {
      const hand = this.hands[player.id];
      const value = hand.dominoes.reduce((acc, domino) => {
        return acc += domino[0] + domino[1];
      }, 0);
      this.players[player.id].scores.push({ value });
    });

  }
}

module.exports = { Game, createDominoes, isSameDomino };