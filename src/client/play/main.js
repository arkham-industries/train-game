
Vue.component('domino', {
  props:['domino'],
  template: `
    <div
      class="domino"
      v-bind:class="{ empty: !domino }"
      v-on:click="$emit('domino-selected', domino)">
      <div class="domino-top-half">{{domino ? domino[0] : '?'}}</div>
      <div class="domino-bottom-half">{{domino ? domino[1] : '?'}}</div>
    </div>
  `
});

Vue.component('domino-list', {
  props:['dominoes'],
  template: `
    <ul class="domino-list">
      <li v-for="domino in dominoes">
        <domino
        v-bind:domino="domino"
        v-on:domino-selected="$emit('domino-selected', domino)">
        </domino>
      </li>
      <li><domino v-on:domino-selected="$emit('domino-selected')" ></domino></li>
    </ul>
  `
});

Vue.component('train', {
  props:['train'],
  template: `
    <div class="train">
      <domino-list
        v-bind:dominoes="train.dominoes"
        v-on:domino-selected="$emit('domino-selected', $event)">
      </domino-list>
    </div>
  `
});

var app = new Vue({
  el: '#app',
  data: {
    game: {}
  },
  created: function () {
    console.log('vue is created')
  },
  watch: {
    game: function() {
      console.log('vue heard game update', this.game);
    }
  },
  methods: {
    onDominoSelectedFromHand: function (domino) {
      console.log('this domino was selected!', domino);
    },
    onTrainSelected: function (trainId) {
      console.log('this train was selected!', trainId);
    }
  }
})

function showInviteUrl(inviteUrl) {
  return document.getElementById('invite-link').innerHTML = inviteUrl;
}

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
    console.log('game fetch failed', err);
  });
}

function startGame() {
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
    console.log('start failed', err);
  });
}

window.addEventListener('load', (event) => {
  setInterval(() => {
    getGame().then((game) => {
      const inviteUrl = `${window.location.origin}/join/${game.id}`;
      showInviteUrl(inviteUrl);
      app.game = game;
    })
  }, 2000);
});
