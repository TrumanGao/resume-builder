import { createApp } from 'vue'
import { pinia } from './stores'

import App from './App.vue'
import { router } from './router'

import './assets/style/base.css'
import './assets/style/element.less'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')

console.log('process.env.RESUME_MAP.size: ', Object.keys(process.env.RESUME_MAP as any).length)
