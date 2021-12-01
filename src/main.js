import { createApp } from 'vue'
import App from './Index.vue'
import './assets/css/_tooltip.scss'
import './registerServiceWorker'
import router from './router'
import store from './store'

import fontawesomecss from '@fortawesome/fontawesome-free/css/all.min.css'
import fontawesomejs from '@fortawesome/fontawesome-free/js/fontawesome.min'

createApp(App)
  .use(store)
  .use(router)
  .use(fontawesomecss)
  .use(fontawesomejs)
  .mount('#app')
