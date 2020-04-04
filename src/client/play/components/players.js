Vue.component('players', {
  props:['playerOrder', 'playerSizes', 'currentIndex'],
  template: `
    <div
      v-if="playerOrder"
      class="players"> 
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
  `
});