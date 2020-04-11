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
  name:'Players',
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

<style lang="scss" scoped>
.players-region {
  display: relative;

  .players {
    position: fixed;
    top: 6px;
    right: 10px;
    padding: 10px 20px;
    background-color: #00000085;
    color: #fff;
    border-radius: 5px;
    z-index: 1;
    min-width: 100px;
    min-height: 10px;

    &.hidden {
      top: calc(-100% -10px);
    }
    h2 {
      margin: 0 0 5px 0;
    }
    ol {
      margin: 0;
      padding: 0 0 0 20px;
    }
    .show-toggle-button {
      text-align: center;
      padding: 0;
      position: absolute;
      top: 5px;
      right: 10px;
      background: transparent;
      border: none;
      font-size: 16px;
      color: white;
      cursor: pointer;
    }
    
  }
  .player-content{
    &.hidden {
      display: none;
    }
  }
}
</style>