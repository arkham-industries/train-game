Vue.component('train', {
  props:['train', 'selectedTrain', 'myTrain'],
  template: `
    <div
      class="train"
      v-bind:class="{ public: train.public || myTrain, 'mexican-train': !train.owner  }">
      <div class="train-info">
        <div v-if="train.public || myTrain" class="train-icon">🚂</div>
        <div class="train-owner">
          {{train.owner ? train.owner.name : '🤠'}}
        </div>
      </div>
      <domino-list
        v-bind:dominoes="train.dominoes"
        v-bind:rotate-doubles="true"
        v-bind:orientation="'horizontal'"
        v-bind:selected-domino-index="selectedTrain ? null : undefined"
        v-on:domino-selected="$emit('domino-selected', $event)">
      </domino-list>
    </div>
  `,
});