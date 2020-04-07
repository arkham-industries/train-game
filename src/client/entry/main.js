function showLink(joinCode) {
  const url = `/join/${joinCode}`;
  document.getElementById('join-link').setAttribute('href', url);
  document.getElementById('join-link').text = 'Join Game';
}

function startGame() {
  fetch('game', { method: 'POST'})
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    showLink(json.joinCode);
  });
}

