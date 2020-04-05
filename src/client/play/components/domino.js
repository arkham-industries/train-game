Vue.component('domino', {
  props:['domino', 'selected', 'orientation', 'moveable'],
  template: `
    <div class="domino-container">
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
      <div
        v-if="moveable && selected"
        v-on:click="$emit('move-left', domino)"
        class="left-arrow">
        ←
      </div>
      <div
        v-if="moveable && selected"
        v-on:click="$emit('move-right', domino)"
        class="right-arrow">
        →
      </div>
    </div>
  `,
  created: function() {
    console.log('domino', this.domino, this.orientation);
  }
});