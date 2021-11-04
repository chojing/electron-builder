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
    path: '/emergency',
    name: 'Emergency',
    component: () => import('../views/Emergency.vue')
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
    path: '/historyDetail',
    name: 'HistoryDetail',
    component: () => import('../views/HistoryDetail.vue')
  },
  {
    path: '/template_history_list',
    name: 'Template_history_list',
    component: () => import('../components/history/Template_history_list.vue')
  },
  {
    path: '/manualFileUpLoad',
    name: 'ManualFileUpLoad',
    component: () => import('../components/manual/ManualFileUpLoad.vue')
  },
  {
    path: '/fileUpLoad',
    name: 'FileUpLoad',
    component: () => import('../components/main/FileUpLoad.vue')
  },
  {
    path: '/template_tree',
    name: 'Template_tree',
    component: () => import('../components/main/Template_tree.vue')
  },
  {
    path: '/userInfo',
    name: 'UserInfo',
    component: () => import('../components/main/UserInfo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
