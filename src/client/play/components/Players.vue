<template>
  <div
    v-if="playerOrder"
    class="players"> 
    <div
      class="player-content"
      v-bind:class="{ hidden: playersHidden }">
      <h2>Players</h2>
      <ol>
        <li
          class="player"
          v-for="(player, index) in playerOrder"
          v-bind:key="player.id">
          {{currentIndex === index ? '▶' : ''}} {{ player.name }} - {{playerSizes[index]}} dominoes
        </li>
      </ol>
    </div>
    <button
      v-on:click="togglePlayers()"
      class="show-toggle-button">{{ toggleText }}</button>
  </div>
</template>

<script>
export default {
  props:['playerOrder', 'playerSizes', 'currentIndex'],
  data: function () {
    return { playersHidden: false };
  },
  computed: {
    toggleText() {
      return this.playersHidden ? 'show players' : 'x';
    }
  },
  methods: {
    togglePlayers() {
      this.playersHidden = !this.playersHidden;
    }
  }
};
</script>