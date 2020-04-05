Vue.component('domino', {
  props:['domino', 'selected', 'orientation', 'moveable'],
  template: `
    <div
      class="domino-container">
      <div
        class="domino"
        tabindex="0"
        ref="domino"
        v-bind:class="{
          empty: !domino,
          selected: selected,
          vertical: orientation === 'vertical', 
          horizontal: orientation === 'horizontal', 
        }"
        v-on:click="$emit('domino-selected', domino)"
        v-on:keyup.arrow-left.stop="$emit('move-left', domino)"
        v-on:keyup.arrow-right.stop="$emit('move-right', domino)"
        v-on:keyup.arrow-up="onFlip()">
        <div class="domino-top-half">{{myDomino ? myDomino[0] : '?'}}
        </div><div class="domino-bottom-half">{{myDomino ? myDomino[1] : '?'}}
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
  data: function() {
    return { myDomino: undefined }
  },
  created: function() {
    this.myDomino = this.domino;
  },
  watch: {
    selected: function() {
      if (this.selected) {
        this.$refs.domino.focus();
      }
    }
  },
  methods: {
    onFlip: function() {
      this.myDomino = [this.myDomino[1], this.myDomino[0]];
    }
  }
});