<template>
  <div
    class="domino-container"
    v-bind:class="{add: specialType === 'add'}">
    <div
      v-if="specialType === 'add'"
      class="domino vertical"
      v-on:click="onClick()">
      +
    </div>
    <div
      v-else
      class="domino"
      ref="domino"
      v-bind:class="{
        empty: !domino,
        selected: selected,
        vertical: orientation === 'vertical', 
        horizontal: orientation === 'horizontal', 
      }"
      v-on:click="onClick()">
      <div class="domino-top-half">{{myDomino ? myDomino[0] : ''}}
      </div><div class="domino-bottom-half">{{myDomino ? myDomino[1] : ''}}
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
</template>

<script>
export default {
  name:'Domino',
  props:['domino', 'selected', 'orientation', 'moveable', 'defaultSymbol', 'specialType'],
  data() {
    return { myDomino: undefined }
  },
  created() {
    this.myDomino = this.domino;
  },
  watch: {
    selected() {
      if (this.selected) {
        this.$refs.domino.focus();
      }
    }
  },
  methods: {
    onFlip() {
      this.myDomino = [this.myDomino[1], this.myDomino[0]];
    },
    onClick() {
      if (!this.selected) {
        this.$emit('domino-selected', this.domino)
      } else {
        this.onFlip();
      }
      
    }
  }
};
</script>
