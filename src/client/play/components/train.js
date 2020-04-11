Vue.component('train', {
  props:['train', 'selectedTrain', 'myTrain', 'myTurn', 'openDoubleValue'],
  template: `
    <div
      class="train"
      v-bind:class="{ playable: trainPlayable, 'mexican-train': !train.owner  }">
      <div class="train-info">
        <div v-if="train.public" class="train-icon">🚂</div>
        <div class="train-owner">
          {{train.owner ? train.owner.name : '🤠'}}
        </div>
      </div>
      <domino-list
        v-bind:dominoes="train.dominoes"
        v-bind:rotate-doubles="true"
        v-bind:hide-extra-domino="!(myTurn && trainPlayable)"
        v-bind:orientation="'horizontal'"
        v-bind:selected-domino-index="selectedTrain ? null : undefined"
        v-on:domino-selected="$emit('domino-selected', $event)">
      </domino-list>
    </div>
  `,
  computed: {
    isOpenDouble() {
      const lastDomino = this.train.dominoes[this.train.dominoes.length - 1];
      return this.openDoubleValue === lastDomino[0] && this.openDoubleValue === lastDomino[1];
    },
    trainPlayable() {
      const openDoublePresent = this.openDoubleValue !== null && this.openDoubleValue !== undefined;
      if (openDoublePresent) {
        // only highlight the open double on the player's turn
        return this.isOpenDouble;
      } else {
        // highlight the playable trains on the player's turn
        return this.train.public || this.myTrain;
      }
    }
  }
});