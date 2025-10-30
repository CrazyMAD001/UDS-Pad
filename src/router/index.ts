import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/networkTest'
  },
  { path: '/networkTest', component: () => import('../views/test/NetWorkConfig.vue') },
  {
    path: '/folder/:id',
    component: () => import('../views/FolderPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
