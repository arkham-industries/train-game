<template>
  <div class="message" v-if="myText">{{ myText }}</div>
</template>

<script>
export default {
  props: ['message'],
  data() {
    return { myText: undefined };
  },
  watch: {
    message() {
      this.myText = this.message.text;
      if (this.message.duration !== null) {
        setTimeout(() => this.myText = undefined, this.message.duration || 4000);
      }
    }
  }
};
</script>