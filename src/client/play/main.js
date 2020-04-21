import Vue from 'vue';
import App from './components/App.vue';
import 'whatwg-fetch';  // polyfill for window.fetch
import Bugsnag from '@bugsnag/js';
import BugsnagPluginVue from '@bugsnag/plugin-vue'

if (process.env.BUGSNAG_API_KEY && process.env.NODE_ENV === 'production') {
  Bugsnag.start({
    apiKey: process.env.BUGSNAG_API_KEY,
    plugins: [new BugsnagPluginVue(Vue)]
  })
}

new Vue({ render: createElement => createElement(App) }).$mount('#app');