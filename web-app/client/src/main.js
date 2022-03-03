import Vue from 'vue'
import VueCookies from 'vue-cookies'
import App from './App.vue'
import router from './router'
import "@/plugins/echarts";
import 'bootstrap/dist/css/bootstrap.min.css'
import BootstrapVue from 'bootstrap-vue/dist/bootstrap-vue.esm';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'bootstrap/dist/css/bootstrap.css';
import "@/assets/css/main.css"
import "@/assets/css/poll.css"
import VueChartkick from 'vue-chartkick'
import Charts from 'chart.js'



// Require dependencies

// Tell Vue to use the plugin
Vue.use(BootstrapVue);
Vue.use(VueCookies);
Vue.use(VueChartkick.use(Charts));

Vue.config.productionTip = false

new Vue({
  render: function (h) { return h(App) },
  router,
}).$mount('#app')

