import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

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
    path: '/mainFileUpLoad',
    name: 'MainFileUpLoad',
    component: () => import('../components/main/MainFileUpLoad.vue')
  },
  {
    path: '/emergency',
    name: 'Emergency',
    component: () => import('../views/Emergency.vue')
  },
  {
    path: '/emergencyFileUpLoad',
    name: 'EmergencyFileUpLoad',
    component: () => import('../components/emergency/EmergencyFileUpLoad.vue')
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
    path: '/manualFileUpload',
    name: 'ManualFileUpload',
    component: () => import('../components/manual/ManualFileUpload.vue')
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
    path: '/receivedHistory',
    name: 'ReceivedHistory',
    component: () => import('../views/ReceivedHistory.vue')
  },
  {
    path: '/receivedHistoryDetail',
    name: 'ReceivedHistoryDetail',
    component: () => import('../views/ReceivedHistoryDetail.vue')
  },
  {
    path: '/template_history_list',
    name: 'Template_history_list',
    component: () => import('../components/history/Template_history_list.vue')
  },
  {
    path: '/template_fileUpLoad',
    name: 'Template_fileUpLoad',
    component: () => import('../components/fileUpload/Template_file.vue')
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
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

export default router
