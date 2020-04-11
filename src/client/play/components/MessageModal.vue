<template>
  <div class="message" v-if="myText">{{ myText }}</div>
</template>

<script>
export default {
  name:'MessageModal',
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

<style lang="scss" scoped>
.message {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #007bff;
  padding: 15px;
  border-radius: 3px;
  color: white;
  text-align: center;
}
</style>