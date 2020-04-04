Vue.component('train', {
  props:['train', 'selectedTrain', 'myTrain'],
  template: `
    <div
      class="train"
      v-bind:class="{ public: train.public || myTrain }">
      <domino-list
        v-bind:dominoes="train.dominoes"
        v-bind:rotate-doubles="true"
        v-bind:orientation="'horizontal'"
        v-bind:selected-domino-index="selectedTrain ? null : undefined"
        v-on:domino-selected="$emit('domino-selected', $event)">
      </domino-list>
    </div>
  `
});