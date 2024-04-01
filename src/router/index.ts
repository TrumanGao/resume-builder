import { createRouter, createWebHashHistory } from 'vue-router'
import ResumeView from '../views/ResumeView.vue'
import BuilderView from '../views/BuilderView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'default',
      redirect: '/resume/aamirkhan'
    },
    {
      path: '/resume/:username?',
      name: 'resume',
      component: ResumeView
    },
    {
      path: '/builder',
      name: 'builder',
      component: BuilderView
    }
  ]
})

export { router }
