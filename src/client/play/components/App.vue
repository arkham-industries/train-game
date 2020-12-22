<template>
  <div class="game">
    <div
      v-if="!game.started"
      class="prestart-region">
      <div class="centered-container">
        <div v-if="isPlayerOne">
          <p>Invite players by sending link!</p>
          <p id="invite-link">{{ inviteUrl }}</p>
          <p>(2 players required)</p>
          <button
            class="big-button"
            v-on:click="requestToStartGame()"
            v-bind:disabled="game.playerOrder.length < 2">
            Start Game!
          </button>
        </div>
        <p v-if="isPlayerOne === false">Waiting for first player to start game ...</p>
      </div>
    </div>
    <div
      v-if="game.ended"
      class="ended-region">
      <GameSummary
        v-bind:player-order="game.playerOrder"
        v-on:start-new-game="requestToStartGame()">
      </GameSummary>
    </div>
    <div class="players-region">
      <Players
        v-bind:player-order="game.playerOrder"
        v-bind:player-sizes="game.playerSizes"
        v-bind:current-index="game.currentTurn && game.currentTurn.index">
      </Players>
    </div>
    <div
      v-if="game.hand"
      class="player-hand-region">
      <div class="your-turn-text" v-if="game.myTurn">It's your turn!</div>
      <PlayerHand
        v-bind:dominoes="game.hand"
        v-bind:hide-extra-domino="!game.myTurn"
        v-bind:selected-domino="selected.domino"
        v-on:domino-selected="onDominoSelectedFromHand($event)">
      </PlayerHand>
      <button
        v-if="game.myTurn"
        v-on:click="onEndTurn()"
        class="big-button end-turn-button">
        End Turn
      </button>
    </div>
    <div
      v-if="game.trains && game.trains.length > 0"
      class="train-region">
      <p class="boneyard-count">Boneyard: {{ game.boneyardSize }} dominoes</p>
      <Train
        v-for="train in game.trains"
        v-bind:my-turn="game.myTurn"
        v-bind:train="train"
        v-bind:my-train="train.owner && train.owner.id === game.myPlayerId"
        v-bind:open-double-value="game.openDoubleValue"
        v-bind:key="train.id"
        v-on:train-selected="onTrainSelected($event)">
      </Train>
    </div>
    <MessageModal v-bind:message="message"></MessageModal>
    <div class="version">{{ version }}</div>
  </div>
</template>

<script>

import MessageModal from './MessageModal';
import Train from './Train';
import DominoList from './DominoList';
import GameSummary from './Summary';
import Players from './Players';
import PlayerHand from './PlayerHand';
import { debounce } from 'lodash-es';

export default {
  components: {
    PlayerHand,
    MessageModal,
    Train,
    DominoList,
    MessageModal,
    GameSummary,
    Players
  },
  data() {
    return {
      version: 'v1.0.4',
      game: {},
      selected: {
        domino: undefined,
        trainId: undefined,
      },
      selectedTrains: [],
      message: {
        text: undefined,
        duration: undefined
      }
    };
  },
  created () {
    console.log('vue is created');
    // start polling for game state
    setInterval(() => {
      this.requestToGetGame().then((game) => {
        this.game = game;
      })
    }, 2000);

    // prevent drag and click from firing this handler twice
    this.onDominoSelectedFromHand = debounce(this.onDominoSelectedFromHand, 200);
  },
  methods: {
    resetSelection() {
      this.onDominoSelectedFromHand({domino: undefined, index: undefined});
    },
    onDominoSelectedFromHand({domino, index}) {
      if (domino === null) {
        this.requestToTakeDomino();
      } else {
        this.selected.domino = domino;
      }
    },
    onTrainSelected(trainId) {
      if (this.selected.domino !== undefined) {
        this.requestToConnectTrain(this.selected.domino, trainId)
        .then(() => this.resetSelection());
      } else {
        this.message = {text: 'Choose a domino from your hand before selecting a place on a train.'};
      }
    },
    onEndTurn() {
      this.requestToEndTurn();
    },
    requestToConnectTrain(domino, trainId) {
      return fetch(`/my/game/extend-train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ domino, trainId })
      })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message)
          });
        }
        return response.json();
      })
      .then((game) => this.game = game)
      .catch((err) => {
        this.message = {text: err.message};
      });
    },
    requestToEndTurn() {
      return fetch(`/my/game/end-turn`, {
        method: 'POST'
      })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message)
          });
        }
        return response.json();
      })
      .then((game) => this.game = game)
      .catch((err) => {
        this.message = {text: err.message};
      });
    },
    requestToTakeDomino() {
      return fetch(`/my/game/take-domino`, {
        method: 'POST'
      })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message)
          });
        }
        return response.json();
      })
      .then((game) => this.game = game)
      .catch((err) => {
        this.message = {text: err.message};
      });
    },
    requestToStartGame() {
      return fetch(`/my/game/start`, {
        method: 'POST'
      })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.message)
          });
        }
      })
      .catch((err) => {
        this.message = {text: err.message};
      });
    },
    requestToGetGame() {
      return fetch(`/my/game`)
      .then((response) => {
        return response.json().then((json) => {
          if (!response.ok) {
            throw new Error(json.message)
          }
          return json;
        });
      })
      .catch((err) => {
        console.error('game fetch failed', err);
      });
    }
  },
  computed: {
    inviteUrl() {
      return this.game.joinCode ? `${window.location.origin}/join/${this.game.joinCode}` : '';
    },
    isPlayerOne() {
      return this.game.playerOrder && this.game.playerOrder[0].id === this.game.myPlayerId
    }
  }
};
</script>

<style lang="scss">
.player-hand-region {
  .domino-list {
    padding: 0;
    margin: 0;
    li{
      display: inline-block;
      vertical-align: bottom;
    }
    .domino{
      padding: 0px 3px;
      margin: 20px 5px;
      &.selected {
        transform: translateY(-30px);
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.game {
  padding-bottom: 300px;
  margin-top: 50px;
}

#invite-link {
  white-space: nowrap;
}

.end-turn-button {
  padding: 10px 50px;
  font-size: 16px;
  margin-top: 5px;
}

.boneyard-count {
  color: #fff;
  position:fixed;
  top: -5px;
  left: 10px;
}

.version {
  position: fixed;
  bottom: 0;
  right: 0;
  color: #494949;
  z-index: 2;
}

.player-hand-region {
  position: fixed;
  bottom: 0;
  background-color: #00000085;
  left: 0;
  right: 0;
  text-align: center;
  padding: 10px;
  z-index: 1;

  .your-turn-text {
    color: #fff;
  }
}
</style>
