<template>
<div
  class="centered-container darker">
  <h1>Round Ended!</h1>
  <table class="game-summary">
    <tr>
      <th>Player</th>
      <th
        v-for="(round, index) in rounds"
        v-bind:key="index">
        {{totalRounds - round - 1}}
      </th>
      <th>Total</th>
    </tr>
    <tr
      v-for="(player, index) in playerOrder"
      v-bind:key="player.id">
      <td class="name-cell">{{ player.name }}</td>
      <td 
        v-for="(round, index) in rounds"
        v-bind:key="index"
        class="score-cell">
        {{(player.scores[round] && player.scores[round].value) === undefined ? '-' : player.scores[round].value}}
      </td>
      <td 
      class="score-cell total">
      {{totals[index]}}
    </td>
    </tr>
  </table>
  <button class="big-button" v-on:click="$emit('start-new-game')">Start Next Round!</button>
</div>
</template>

<script>
export default {
  props:['playerOrder'],
  data() {
    const totalRounds = 13;
    return {
      totalRounds,
      rounds: [...Array(totalRounds).keys()]
    }
  },
  computed: {
    totals() {
      return this.playerOrder.map((player) => {
        return player.scores.reduce((acc, score) => acc += score.value, 0);
      }, 0);
    }
  }
};
</script>
