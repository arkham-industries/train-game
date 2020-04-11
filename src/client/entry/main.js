import 'whatwg-fetch';  // polyfill for window.fetch

window.startGame = () => {
  fetch('game', { method: 'POST'})
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    window.location.href = `/join/${json.joinCode}`;
  });
}

