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
    component: () => import('../views/Test')
  },
  {
    path: '/test2',
    name: 'test2',
    component: () => import('../views/Test2')
  },
  {
    path: '/loading',
    name: 'loading',
    component: () => import('../views/Loading')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login')
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import('../views/Main')
  },
  {
    path: '/mainFileUpLoad',
    name: 'MainFileUpLoad',
    component: () => import('../components/main/MainFileUpLoad')
  },
  {
    path: '/emergency',
    name: 'Emergency',
    component: () => import('../views/Emergency')
  },
  {
    path: '/emergencyFileUpLoad',
    name: 'EmergencyFileUpLoad',
    component: () => import('../components/emergency/EmergencyFileUpLoad')
  },
  {
    path: '/manual',
    name: 'Manual',
    component: () => import('../views/Manual'),
    children: [
      { path: '/user', name: 'UserManage', component: () => import('../components/manual/Template_manualUser') },
      { path: '/ftp', name: 'FTPManage', component: () => import('../components/manual/Template_manualFtp') }
    ]
  },
  {
    path: '/manualFtp',
    name: 'ManualFtp',
    component: () => import('../components/manual/ManualFtp')
  },
  {
    path: '/manualFileUpload',
    name: 'ManualFileUpload',
    component: () => import('../components/manual/ManualFileUpload')
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/History')
  },
  {
    path: '/historyDetail',
    name: 'HistoryDetail',
    component: () => import('../views/HistoryDetail')
  },
  {
    path: '/receivedHistory',
    name: 'ReceivedHistory',
    component: () => import('../views/ReceivedHistory')
  },
  {
    path: '/receivedHistoryDetail',
    name: 'ReceivedHistoryDetail',
    component: () => import('../views/ReceivedHistoryDetail')
  },
  {
    path: '/template_history_list',
    name: 'Template_history_list',
    component: () => import('../components/history/Template_history_list')
  },
  {
    path: '/template_fileUpLoad',
    name: 'Template_fileUpLoad',
    component: () => import('../components/fileUpload/Template_file')
  },
  {
    path: '/template_tree',
    name: 'Template_tree',
    component: () => import('../components/main/Template_tree')
  },
  {
    path: '/userInfo',
    name: 'UserInfo',
    component: () => import('../components/main/UserInfo')
  },
  {
    path: '/userPwModify',
    name: 'UserPwModify',
    component: () => import('../components/main/UserPwModify')
  },
  {
    path: '/ftpSiteTransferProgress',
    name: 'FtpSiteTransferProgress',
    component: () => import('../components/main/FTPSiteTransferProgress')
  },
  {
    path: '/userAppointed',
    name: 'UserAppointed',
    component: () => import('../components/receivedHistory/Template_userAppointed')
  },
  {
    path: '/transferRequest',
    name: 'TransferRequest',
    component: () => import('../components/receivedHistory/transferRequest')
  }
]

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

export default router
