Vue.component('domino-list', {
  props:['dominoes', 'selectedDominoIndex'],
  template: `
    <ul class="domino-list">
      <li v-for="(domino, index) in dominoes">
        <domino
        v-bind:domino="domino"
        v-bind:selected="selectedDominoIndex === index"
        v-on:domino-selected="$emit('domino-selected', {domino, index})">
        </domino>
      </li>
      <li>
        <domino
          v-bind:selected="selectedDominoIndex === null"
          v-on:domino-selected="$emit('domino-selected', {domino: null, index: null})">
        </domino>
      </li>
    </ul>
  `
});