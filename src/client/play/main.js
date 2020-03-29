
Vue.component('domino', {
  props:['domino'],
  template: `
    <div>{{domino}}</div>
  `,
  created: function() { console.log('domino created', this) },
  watch: {
    dominoes: function () { console.log('domino!', this.dominoes) }
  }
});

Vue.component('domino-list', {
  props:['dominoes'],
  template: `
    <ul>
      <li v-for="domino in dominoes">
        <domino v-bind:domino="domino"></domino>
      </li>
    </ul>
  `,
  created: function() { console.log('domino-list created', this) },
  watch: {
    dominoes: function () { console.log('dominoes!', this.dominoes) }
  }
});

var app = new Vue({
  el: '#app',
  data: {
    game: {}
  },
  watch: {
    game: function() {
      console.log('vue heard game update', this.game);
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
