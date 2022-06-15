import VueRouter from 'vue-router';

import Home from './views/Home.vue';

export function createRouter() {
  const router = new VueRouter({
    mode: 'history',
    base: process.env.VUE_APP_BASE_URL,
    routes: [
      { path: '/home', name: 'home', component: Home },
    ]
  });

  return router;
}
