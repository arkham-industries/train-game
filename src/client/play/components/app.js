Vue.component('app', {
  template: `
    <div class="game">
      <div class="prestart-region">
        <div
          v-if="!game.started"
          class="centered-container">
          <div v-if="isPlayerOne">
            <p id="invite-link">{{ inviteUrl }}</p>
            <button class="big-button" v-on:click="requestToStartGame()">Start Game!</button>
          </div>
          <p v-if="isPlayerOne === false">Waiting for first player to start game ...</p>
        </div>
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
          v-bind:selected-domino="selected.domino"
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
          v-bind:train="train"
          v-bind:selected-train="selectedTrains[index]"
          v-bind:my-train="train.owner && train.owner.id === game.myPlayerId"
          v-bind:key="train.id"
          v-on:domino-selected="onTrainSelected(train.id)">
        </train>
      </div>
      <message-modal v-bind:message="message"></message-modal>
    </div>
  `,
  data: function() {
    return {
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
  watch: {
    selected: {
      deep: true,
      handler: function() {
        console.log('selected', this.selected);
        if (this.selected.domino === null) {
          this.requestToTakeDomino()
          .then(() => this.resetSelection());
        } else if (this.selected.domino !== undefined && this.selected.trainId !== undefined) {
          this.requestToConnectTrain(this.selected.domino, this.selected.trainId)
          .then(() => this.resetSelection());
        }
      }
    },
    'game.winner': function() {
      this.message = { text: `Player ${game.winner.name} won!`, duration: null};
    }
  },
  methods: {
    resetSelection: function() {
      this.onDominoSelectedFromHand({domino: undefined, index: undefined});
      this.onTrainSelected(undefined);
    },
    onDominoSelectedFromHand: function ({domino, index}) {
      this.selected.domino = domino;
      console.log('this domino was selected!', domino, index);
    },
    onTrainSelected: function (trainId) {
      this.selected.trainId = trainId;
      this.selectedTrains = this.game.trains.map((train) => train.id === trainId);
      console.log('this train was selected!', trainId);
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