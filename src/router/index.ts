import { createRouter, createWebHistory } from 'vue-router'
import ResumeView from '../views/ResumeView.vue'
import WelcomeView from '../views/WelcomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView
    },
    {
      path: '/resume/:username',
      name: 'resume',
      component: ResumeView
    }
  ]
})

export { router }
