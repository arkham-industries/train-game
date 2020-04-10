Vue.component('game-summary', {
  props:['playerOrder'],
  template: `
    <div
      class="centered-container">
      <h1>Round Ended!</h1>
      <table class="game-summary">
        <tr v-for="player in playerOrder">
          <td>{{ player.name }}</td>
          <td 
            v-for="score in player.scores"
            class="score-cell">
            {{score.value}}
          </td>
        </tr>
      </table>
      <button class="big-button" v-on:click="$emit('start-new-game')">Start Next Round!</button>
    </div>
  `
})