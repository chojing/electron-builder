import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/loading'
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
    component: () => import('../components/manual/ManualFtp.vue')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History.vue')
  },
  {
    path: '/manualFileUpLoad',
    name: 'ManualFileUpLoad',
    component: () => import('../views/ManualFileUpLoad.vue')
  },
  {
    path: '/fileUpLoad',
    name: 'FileUpLoad',
    component: () => import('../views/FileUpLoad.vue')
  },
  {
    path: '/template_tree',
    name: 'Template_tree',
    component: () => import('../components/main/Template_tree.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
