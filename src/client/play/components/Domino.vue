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

<style lang="scss" scoped>
.domino-container {
  position: relative;
  font-family: sans-serif;

  &.add {

    &:after {
      content: "draw";
      position: absolute;
      bottom: -20px;
      left: 5px;
      font-size: 18px;
      color: #fff;
    }

    .domino {
      border: 2px dashed #a5a5a5;
      font-size: 32px;
      color: #4d4d46;
      height: 67px;
      line-height: 67px;
      vertical-align: bottom;
    }
  }

  .domino {
    color: #4d4d46;
    border: 1px solid #c8c8bd;
    background-color: ivory;
    box-shadow: 1px 1px 0px #a2a296;
    padding: 3px;
    text-align: center;
    border-radius: 3px;
    cursor: pointer;
    transition: transform .1s;
  
    &.vertical {
      width: 35px;
  
      .domino-top-half, .domino-bottom-half{
        padding: 8px 0;
      }
  
      .domino-top-half {
        border-bottom: 1px solid;
      }
    }
  
    &.horizontal {
      .domino-top-half, .domino-bottom-half{
        display: inline-block;
        height: 25px;
        line-height: 17px;
        width: 30px;
        padding: 8px 3px 0 3px;
      }
  
      .domino-top-half {
        border-right: 1px solid;
        padding-right: 3px;
      }
    }
  
    &.empty {
      border: 2px dashed #4dc600;
      background-color: #d2ffd2;
    }
  
  }
}
</style>