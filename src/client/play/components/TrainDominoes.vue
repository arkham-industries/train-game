<template>
  <ul v-if="myDominoes" class="domino-list">
    <li
      v-for="(domino) in myDominoes"
      v-bind:key="domino[0] + '-' + domino[1]">
      <Domino
        v-bind:domino="domino"
        v-bind:moveable="false"
        v-bind:orientation="getOrientation(domino)">
      </Domino>
    </li>
    <draggable
      v-if="extendable"
      class="drop-zone"
      tag="li"
      group="dominoes"
      ghost-class="ghost"
      v-bind:swap-threshold="1"
      v-on:add="onDragAdd($event)">
    </draggable>
  </ul>
</template>

<script>
import Domino from './Domino';
import draggable from 'vuedraggable'

export default {
  name:'TrainDominoes',
  props:['dominoes', 'extendable'],
  components: {
    Domino,
    draggable
  },
  data() {
    return { myDominoes: [] };
  },
  watch: {
    dominoes() {
      // remove any dominoes that are not in the incoming set
      this.myDominoes.forEach((myDomino, i) => {
        const existingIndex = this.dominoes.findIndex((domino) => this.isSameDomino(myDomino, domino))
        if(existingIndex === -1) {
          // domino does not exist in the new set of dominoes
          // we want to remove it
          this.myDominoes.splice(i, 1);
        }
      });

      // identify new dominoes
      const extraDominoes = this.dominoes.filter((domino) => {
        return !this.myDominoes.some((myDomino) => this.isSameDomino(domino, myDomino));
      });

      // push new dominoes onto myDominoes (mutate)
      extraDominoes.forEach((domino) => {
        this.myDominoes.push(domino);
      });

    }
  },
  methods: {
    isDouble(domino) {
      return domino[0] === domino[1];
    },
    getOrientation(domino) {
      return this.isDouble(domino) ? 'vertical' : 'horizontal'; 
    },
    isSameDomino(dominoA, dominoB) {
      if (!dominoA || !dominoB) { return false; }
      return (dominoA[0] === dominoB[0] && dominoA[1] === dominoB[1]) || (dominoA[0] === dominoB[1] && dominoA[1] === dominoB[0]);
    },
    onDragAdd(ev) {
      this.$emit('train-extended');
    }
  }
};
</script>

<style lang="scss" scoped>
.drop-zone {
  min-width: 35px;
  min-height: 35px;
}
.ghost {
  opacity: 0.5;
}
</style>