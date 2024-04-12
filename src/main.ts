import { createApp } from 'vue'
import { pinia } from './stores'

import App from './App.vue'
import { router } from './router'

import './assets/style/base.css'
import './assets/style/element.less'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)

app.mount('#app')

console.log('process.env.RESUME_MAP: ', process.env.RESUME_MAP)
