Vue.component('domino-list', {
  props:['dominoes', 'selectedDominoIndex', 'orientation', 'rotateDoubles'],
  template: `
    <ul class="domino-list">
      <li v-for="(domino, index) in dominoes">
        <domino
        v-bind:domino="domino"
        v-bind:orientation="getOrientation(domino)"
        v-bind:selected="selectedDominoIndex === index"
        v-on:domino-selected="$emit('domino-selected', {domino, index})">
        </domino>
      </li>
      <li>
        <domino
          v-bind:orientation="orientation"
          v-bind:selected="selectedDominoIndex === null"
          v-on:domino-selected="$emit('domino-selected', {domino: null, index: null})">
        </domino>
      </li>
    </ul>
  `,
  created: function() {
    console.log('dominoes', this.dominoes, this.orientation);
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
    }
  }
});