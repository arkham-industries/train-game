
Vue.component('domino', {
  props:['domino', 'selected'],
  template: `
    <div
      class="domino"
      v-bind:class="{ empty: !domino, selected: selected }"
      v-on:click="$emit('domino-selected', domino)">
      <div class="domino-top-half">{{domino ? domino[0] : '?'}}</div>
      <div class="domino-bottom-half">{{domino ? domino[1] : '?'}}</div>
    </div>
  `
});

Vue.component('domino-list', {
  props:['dominoes', 'selectedDominoIndex'],
  template: `
    <ul class="domino-list">
      <li v-for="(domino, index) in dominoes">
        <domino
        v-bind:domino="domino"
        v-bind:selected="selectedDominoIndex === index"
        v-on:domino-selected="$emit('domino-selected', {domino, index})">
        </domino>
      </li>
      <li>
        <domino
          v-bind:selected="selectedDominoIndex === null"
          v-on:domino-selected="$emit('domino-selected', {domino: null, index: null})">
        </domino>
      </li>
    </ul>
  `,
});

Vue.component('train', {
  props:['train', 'selectedTrain'],
  template: `
    <div class="train">
      <domino-list
        v-bind:dominoes="train.dominoes"
        v-bind:selected-domino-index="selectedTrain ? null : undefined"
        v-on:domino-selected="$emit('domino-selected', $event)">
      </domino-list>
    </div>
  `
});

Vue.component('players', {
  props:['playerOrder', 'playerSizes', 'currentIndex'],
  template: `
    <div class="players"> 
      <ol>
        <li
          class="player"
          v-for="(player, index) in playerOrder"
          v-bind:key="player.id">
          {{currentIndex === index ? '▶' : ''}} {{ player.name }} - {{playerSizes[index]}} dominoes
        </li>
      </ol>
    </div>
  `
});

var app = new Vue({
  el: '#app',
  data: {
    game: {},
    selected: {
      dominoIndex: undefined,
      trainId: undefined,
    },
    selectedTrains: [],
    message: undefined
  },
  created: function () {
    console.log('vue is created')
  },
  watch: {
    game: function() {
      console.log('vue heard game update', this.game);
    },
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
    message: function() {
      setTimeout(() => this.message = undefined, 4000);
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
        this.message = err.message;
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
        this.message = err.message;
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
        this.message = err.message;
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
        this.message = err.message;
      });
    }
  },
  computed: {
    inviteUrl: function() {
      return this.game.id ? `${window.location.origin}/join/${this.game.id}` : '';
    }
  }
})

function getGame() {
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


window.addEventListener('load', (event) => {
  setInterval(() => {
    getGame().then((game) => {
      app.game = game;
    })
  }, 2000);
});
