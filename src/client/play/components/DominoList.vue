<template>
  <draggable
    v-if="myDominoes"
    v-model="myDominoes"
    tag="ul"
    class="domino-list"
    group="dominoes"
    ghost-class="ghost"
    filter=".not-draggable"
    v-bind:disabled="!sortable"
    v-bind:swap-threshold="1"
    v-bind:invert-swap="false"
    v-bind:animation="150">
    <li
      v-for="(domino, index) in myDominoes"
      v-bind:key="domino[0] + '-' + domino[1]">
      <Domino
        v-bind:domino="domino"
        v-bind:moveable="sortable"
        v-bind:orientation="getOrientation(domino)"
        v-bind:selected="isSameDomino(selectedDomino, domino)"
        v-on:domino-selected="$emit('domino-selected', {domino, index})">
      </Domino>
    </li>
    <li class="not-draggable">
      <Domino
        v-if="!hideExtraDomino"
        v-bind:special-type="extraDominoType"
        v-bind:orientation="orientation"
        v-bind:selected="selectedDomino === null"
        v-on:domino-selected="$emit('domino-selected', {domino: null, index: null})">
      </Domino>
    </li>
  </draggable>
</template>

<script>
import Domino from './Domino';
import draggable from 'vuedraggable'

export default {
  name:'DominoList',
  props:['dominoes', 'selectedDomino', 'orientation', 'rotateDoubles', 'sortable', 'hideExtraDomino', 'extraDominoType'],
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
    getOrientation (domino) {
      return this.rotateDoubles && this.isDouble(domino) ? this.flipOrientation() : this.orientation; 
    },
    flipOrientation(orinetation) {
      return this.orinetation === 'vertical' ? 'horizontal' : 'vertical';
    },
    isSameDomino(dominoA, dominoB) {
      if (!dominoA || !dominoB) { return false; }
      return (dominoA[0] === dominoB[0] && dominoA[1] === dominoB[1]) || (dominoA[0] === dominoB[1] && dominoA[1] === dominoB[0]);
    }
  }
};
</script>

<style lang="scss" scoped>
.ghost {
  opacity: 0.5;
}
</style>