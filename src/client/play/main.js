import Vue from 'vue';
import App from './components/App.vue';
import 'whatwg-fetch';  // polyfill for window.fetch

new Vue({ render: createElement => createElement(App) }).$mount('#app');