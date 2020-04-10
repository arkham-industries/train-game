Vue.component('app', {
  template: `
    <div class="game">
      <div class="prestart-region">
        <div
          v-if="!game.started"
          class="centered-container">
          <div v-if="isPlayerOne">
            <p>Invite players by sending link!</p>
            <p id="invite-link">{{ inviteUrl }}</p>
            <button class="big-button" v-on:click="requestToStartGame()">Start Game!</button>
          </div>
          <p v-if="isPlayerOne === false">Waiting for first player to start game ...</p>
        </div>
      </div>
      <div class="ended-region">
        <game-summary
          v-if="game.ended"
          v-bind:player-order="game.playerOrder"
          v-on:start-new-game="requestToStartGame()">
        </game-summary>
      </div>
      <div class="players-region">
        <players
          v-bind:player-order="game.playerOrder"
          v-bind:player-sizes="game.playerSizes"
          v-bind:current-index="game.currentTurn && game.currentTurn.index">
        </players>
      </div>
      <div
        v-if="game.hand"
        class="player-hand-region">
        <div class="your-turn-text" v-if="game.myTurn">It's your turn!</div>
        <domino-list
          v-bind:dominoes="game.hand"
          v-bind:sortable="true"
          v-bind:orientation="'vertical'"
          v-bind:hide-extra-domino="!game.myTurn"
          v-bind:selected-domino="selected.domino"
          v-bind:extra-domino-type="'add'"
          v-on:domino-selected="onDominoSelectedFromHand($event)">
        </domino-list>
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
        <train
          v-for="(train, index) in game.trains"
          v-bind:my-turn="game.myTurn"
          v-bind:train="train"
          v-bind:my-train="train.owner && train.owner.id === game.myPlayerId"
          v-bind:open-double-value="game.openDoubleValue"
          v-bind:key="train.id"
          v-on:domino-selected="onTrainSelected(train.id)">
        </train>
      </div>
      <message-modal v-bind:message="message"></message-modal>
      <div class="version">{{ version }}</div>
    </div>
  `,
  data: function() {
    return {
      version: 'v1.0.0',
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
  created: function () {
    console.log('vue is created');
    // start polling for game state
    setInterval(() => {
      this.requestToGetGame().then((game) => {
        this.game = game;
      })
    }, 2000);
  },
  methods: {
    resetSelection: function() {
      this.onDominoSelectedFromHand({domino: undefined, index: undefined});
    },
    onDominoSelectedFromHand: function ({domino, index}) {
      if (domino === null) {
        this.requestToTakeDomino();
      } else {
        this.selected.domino = domino;
      }
    },
    onTrainSelected: function (trainId) {
      if (this.selected.domino !== undefined) {
        this.requestToConnectTrain(this.selected.domino, trainId)
        .then(() => this.resetSelection());
      } else {
        this.message = {text: 'Choose a domino from your hand before selecting a place on a train.'};
      }
    },
    onEndTurn: function() {
      this.requestToEndTurn();
    },
    requestToConnectTrain: function(domino, trainId) {
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
    requestToEndTurn: function() {
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
    requestToTakeDomino: function() {
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
    requestToStartGame: function() {
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
    requestToGetGame: function() {
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
    inviteUrl: function() {
      return this.game.joinCode ? `${window.location.origin}/join/${this.game.joinCode}` : '';
    },
    isPlayerOne: function() {
      return this.game.playerOrder && this.game.playerOrder[0].id === this.game.myPlayerId
    }
  }
});