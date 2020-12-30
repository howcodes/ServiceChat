import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Vant from "vant"
import "vant/lib/index.css"
import MetaInfo from 'vue-meta-info';

Vue.config.productionTip = false
import preview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
let options = {
  fullscreenEl: false
};
Vue.use(preview, options)
Vue.use(preview)
Vue.use(Vant)
Vue.use(MetaInfo);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
