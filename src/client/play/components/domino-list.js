Vue.component('domino-list', {
  props:['dominoes', 'selectedDomino', 'orientation', 'rotateDoubles', 'sortable', 'hideQuestionMarkDomino'],
  template: `
    <ul
      v-if="myDominoes"
      class="domino-list">
      <li
        v-for="(domino, index) in myDominoes"
        v-bind:key="domino[0] + '-' + domino[1]">
        <domino
        v-bind:domino="domino"
        v-bind:moveable="sortable"
        v-on:move-left="onMove('left', index)"
        v-on:move-right="onMove('right', index)"
        v-bind:orientation="getOrientation(domino)"
        v-bind:selected="isSameDomino(selectedDomino, domino)"
        v-on:domino-selected="$emit('domino-selected', {domino, index})">
        </domino>
      </li>
      <li>
        <domino
          v-if="!hideQuestionMarkDomino"
          v-bind:orientation="orientation"
          v-bind:selected="selectedDomino === null"
          v-on:domino-selected="$emit('domino-selected', {domino: null, index: null})">
        </domino>
      </li>
    </ul>
  `,
  data: function() {
    return { myDominoes: [] };
  },
  watch: {
    dominoes: function() {
      // remove any dominoes that are not in the incoming set
      const keptDominoes = this.myDominoes.filter((myDomino) => {
        return this.dominoes.some((domino) => this.isSameDomino(myDomino, domino));
      });

      // identify new dominoes
      const extraDominoes = this.dominoes.filter((myDomino) => {
        return !this.myDominoes.some((domino) => this.isSameDomino(myDomino, domino));
      });

      this.myDominoes = keptDominoes.concat(extraDominoes);
    }
  },
  methods: {
    isDouble: function(domino) {
      return domino[0] === domino[1];
    },
    getOrientation: function (domino) {
      return this.rotateDoubles && this.isDouble(domino) ? this.flipOrientation() : this.orientation; 
    },
    flipOrientation: function(orinetation) {
      return this.orinetation === 'vertical' ? 'horizontal' : 'vertical';
    },
    isSameDomino: function(dominoA, dominoB) {
      if (!dominoA || !dominoB) { return false; }
      return (dominoA[0] === dominoB[0] && dominoA[1] === dominoB[1]) || (dominoA[0] === dominoB[1] && dominoA[1] === dominoB[0]);
    },
    onMove: function(direction, fromIndex) {
      if (!this.sortable) { return; }
      let toIndex;
      if (direction === 'left') {
        toIndex = fromIndex - 1 < 0 ? 0 : fromIndex - 1;
      } else if (direction === 'right') {
        const maxIndex = this.myDominoes.length - 1;
        toIndex = fromIndex + 1 > maxIndex ? maxIndex : fromIndex + 1;
      }
      var domino = this.myDominoes.splice(fromIndex, 1)[0];
      this.myDominoes.splice(toIndex, 0, domino);
    },

  }
});