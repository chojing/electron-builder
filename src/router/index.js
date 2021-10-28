import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/loading'
    // redirect: '/test'
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/Test.vue')
  },
  {
    path: '/test2',
    name: 'test2',
    component: () => import('../views/Test2.vue')
  },
  {
    path: '/loading',
    name: 'loading',
    component: () => import('../views/Loading.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/Main.vue')
  },
  {
    path: '/manual',
    name: 'Manual',
    component: () => import('../views/Manual.vue')
  },
  {
    path: '/manualFtp',
    name: 'ManualFtp',
    component: () => import('../views/ManualFtp.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
