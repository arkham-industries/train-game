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

window.onload = function() {

  // Allow a user to join game by pressing enter on name input
  var input = document.getElementById("player-name");

  // Execute a function when the user releases a key on the keyboard
  input.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default (form) action
      event.preventDefault();
      // Trigger the button element with a click
      joinGame();
    }
  });
}