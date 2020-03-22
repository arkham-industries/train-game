function getGameId() {
  const params = window.location.pathname.split('/');
  return params[2];
}

function getPlayerName() {
  return document.getElementById('player-name').value;
}

function displayError(message) {
  return document.getElementById('error-message').innerHTML = message;
}

function joinGame() {
  const payload = { name: getPlayerName() };

  fetch(`/game/${getGameId()}/join`, { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-cache',
    body: JSON.stringify(payload)
  })
  .then((response) => {
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(err.message)
      });
    } else {
      window.location.href = '/play';
    }
  })
  .catch((err) => {
    displayError(err.message);
    console.log('join failed', err);
  });

}