function showLink(gameId) {
  const url = `/join/${gameId}`;
  document.getElementById('join-link').setAttribute('href', url);
  document.getElementById('join-link').text = 'Join Game';
}

function startGame() {
  fetch('game', { method: 'POST'})
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    console.log('create game response', json);
    gameId = json.id;
    showLink(gameId);
  });
}

