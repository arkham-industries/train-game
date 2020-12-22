<template>
<div
  class="train"
  v-on:dragover.prevent="onDragOver($event)"
  v-on:dragenter.prevent="onDragEnter($event)"
  v-on:drop.prevent="onDrop($event)"
  v-bind:class="{ playable: trainPlayable, 'mexican-train': !train.owner  }">
  <div class="train-info">
    <div v-if="train.public" class="train-icon">🚂</div>
    <div class="train-owner">
      {{train.owner ? train.owner.name : '🤠'}}
    </div>
  </div>
  <TrainDominoes
    v-bind:dominoes="train.dominoes"
    v-bind:extendable="myTurn"
    v-on:train-extended="$emit('train-selected', train.id)">
  </TrainDominoes>
</div>
</template>

<script>
import TrainDominoes from './TrainDominoes';

export default {
  name:'Train',
  props:['train', 'selectedTrain', 'myTrain', 'myTurn', 'openDoubleValue'],
  components: {
    TrainDominoes
  },
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
  },
  methods: {
    onDragOver() {
    },
    onDragEnter() {
    },
    onDrop(ev) {
      this.$emit('train-selected', this.train.id)
    }
  }
};
</script>

<style lang="scss">
.train-region {
  .domino-list {
    display: inline-block;
    margin: 5px 0px;
    list-style: none;
    padding: 0px 10px;
    li {
      display: inline-block;
      vertical-align: middle;
      margin: 15px 0px;
    }
    .domino {
      margin: 0 3px;
    }
  }
}
</style>

<style lang="scss" scoped>
.train-region {
  .train {
    position: relative;
    white-space: nowrap;
    background-color: #f5968ceb;
    margin: 10px 0;
    border-radius: 5px;
    box-shadow: 2px 2px #e78884;
    display: table;

    &.playable {
      background-color: #ffd890eb;
    }
  
    .train-info {
      display: inline-block;
      vertical-align: middle;
      text-align: center;
      margin-top: -5px;
    }
    .train-icon {
      font-size: 45px;
    }
    .train-owner {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 80px;
    }
  }
  
  .mexican-train {
    .train-owner {
      font-size: 30px;
    }
  }
  
}
</style>