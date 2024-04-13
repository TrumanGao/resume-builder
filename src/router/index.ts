import { createRouter, createWebHashHistory } from 'vue-router'

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
      component: () => import('../views/ResumeView.vue')
    }
  ]
})

export { router }
