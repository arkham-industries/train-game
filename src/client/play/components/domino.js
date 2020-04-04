Vue.component('domino', {
  props:['domino', 'selected', 'orientation'],
  template: `
    <div
      class="domino"
      v-bind:class="{
        empty: !domino,
        selected: selected,
        vertical: orientation === 'vertical', 
        horizontal: orientation === 'horizontal', 
      }"
      v-on:click="$emit('domino-selected', domino)">
      <div class="domino-top-half">{{domino ? domino[0] : '?'}}
      </div><div class="domino-bottom-half">{{domino ? domino[1] : '?'}}
      </div>
    </div>
  `,
  created: function() {
    console.log('domino', this.domino, this.orientation);
  }
});