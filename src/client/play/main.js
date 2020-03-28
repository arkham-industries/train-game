let myGame;
let inviteUrl;

function showInviteUrl(inviteUrl) {
  return document.getElementById('invite-link').innerHTML = inviteUrl;
}

function getGame() {
  fetch(`/my/game`)
  .then((response) => {
    return response.json().then((json) => {
      if (!response.ok) {
        throw new Error(json.message)
      }
      return json;
    });
  })
  .then((game) => {
    myGame = game;
    inviteUrl = `${window.location.origin}/join/${game.id}`;
    showInviteUrl(inviteUrl);
    console.log('got game', game)
  })
  .catch((err) => {
    console.log('game fetch failed', err);
  });
}

function startGame() {

  fetch(`/my/game/start`, { 
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
    getGame();
  }, 2000);
});
