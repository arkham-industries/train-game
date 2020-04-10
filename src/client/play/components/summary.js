Vue.component('game-summary', {
  props:['playerOrder'],
  template: `
    <div
      class="centered-container">
      <h1>Round Ended!</h1>
      <table class="game-summary">
        <tr v-for="(player, index) in playerOrder">
          <td>{{ player.name }}</td>
          <td 
            v-for="round in rounds"
            class="score-cell">
            {{player.scores[round]?.value || '-'}}
          </td>
          <td 
          class="score-cell total">
          {{totals[index]}}
        </td>
        </tr>
      </table>
      <button class="big-button" v-on:click="$emit('start-new-game')">Start Next Round!</button>
    </div>
  `,
  data: function() {
    return { rounds: [...Array(13).keys()] }
  },
  computed: {
    totals() {
      return this.playerOrder.map((player) => {
        return player.scores.reduce((acc, score) => acc += score.value, 0);
      }, 0);
    }
  }
})