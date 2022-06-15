import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import Web3 from 'web3';
import { createStore } from './store';
import { createRouter } from './router';
import App from './App.vue';
import VTooltip from 'v-tooltip';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'nes.css/css/nes.min.css';

let expectedNetworkId: number | null = null;
if(process.env.VUE_APP_EXPECTED_NETWORK_ID) {
  expectedNetworkId = parseInt(process.env.VUE_APP_EXPECTED_NETWORK_ID, 10);
}
const web3 = new Web3(Web3.givenProvider || process.env.VUE_APP_WEB3_FALLBACK_PROVIDER);

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VTooltip);
Vue.use(BootstrapVue);

const VueDragula = require('vue-dragula');
Vue.use(VueDragula);

const store = createStore(web3);
const router = createRouter();

new Vue({
  render: h => h(App),
  router, store,
  provide: {
    web3,
    expectedNetworkId,
  },
}).$mount('#app');
