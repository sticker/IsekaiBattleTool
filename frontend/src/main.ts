import Vue from 'vue';
import Vuex from 'vuex';
import Web3 from 'web3';
import { createStore } from './store';
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
Vue.use(VTooltip);
Vue.use(BootstrapVue);

const VueDragula = require('vue-dragula');
Vue.use(VueDragula);

const store = createStore(web3);

new Vue({
  render: h => h(App),
  store,
  provide: {
    web3,
    expectedNetworkId,
  },
}).$mount('#app');
