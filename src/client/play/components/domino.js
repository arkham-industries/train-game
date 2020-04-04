Vue.component('domino', {
  props:['domino', 'selected'],
  template: `
    <div
      class="domino"
      v-bind:class="{ empty: !domino, selected: selected }"
      v-on:click="$emit('domino-selected', domino)">
      <div class="domino-top-half">{{domino ? domino[0] : '?'}}</div>
      <div class="domino-bottom-half">{{domino ? domino[1] : '?'}}</div>
    </div>
  `
});