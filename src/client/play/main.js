new Vue({
  el: '#app',
  data: {
    game: {},
    selected: {
      dominoIndex: undefined,
      trainId: undefined,
    },
    selectedTrains: [],
    message: {
      text: undefined,
      duration: undefined
    }
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
        if (this.selected.dominoIndex === null) {
          this.requestToTakeDomino()
          .then(() => this.resetSelection());
        } else if (this.selected.dominoIndex !== undefined && this.selected.trainId !== undefined) {
          const domino = this.game.hand[this.selected.dominoIndex];
          this.requestToConnectTrain(domino, this.selected.trainId)
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
      this.selected.dominoIndex = index;
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
      return this.game.id ? `${window.location.origin}/join/${this.game.id}` : '';
    },
    isPlayerOne: function() {
      return this.game.playerOrder && this.game.playerOrder[0].id === this.game.myPlayerId
    }
  }
});