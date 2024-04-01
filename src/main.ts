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

console.log('路由基准地址：', import.meta.env.BASE_URL)

console.log('内存中的简历数据：', process.env.RESUME_MAP)
