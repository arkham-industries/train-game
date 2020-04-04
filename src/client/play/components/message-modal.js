Vue.component('message-modal', {
  props: ['message'],
  data: function() {
    return { myText: undefined };
  },
  template: `
    <div class="message" v-if="myText">{{ myText }}</div>
  `,
  watch: {
    message: function() {
      this.myText = this.message.text;
      if (this.message.duration !== null) {
        setTimeout(() => this.myText = undefined, this.message.duration || 4000);
      }
    }
  }
});