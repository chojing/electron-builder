<template>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
            <h4>전송 Target</h4>
            <!--modify-->
            <button class="btn h30" @click="this.manualFtpPopup">등록</button>
          </div>
        </div>
        <div class="target-list" style="background: #f1fbff;">
          <ul class="one-list">
            <li v-for="item in targetFtpList" v-bind:key="item.userid" @dblclick="this.FileUploadPopup(item)">
              <p>{{item.username}}</p>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateMenu from '@/components/menu/Template_menu'
// import { EventBus } from '@/eventBus'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
// eslint-disable-next-line no-unused-vars
const axios = require('@/assets/js/axios.js')
export default {
  name: 'Manual',
  components: {
    templateMenu
  },
  data () {
    return {
      g_windowIndex: 0,
      targetName: '',
      targetFtpList: [
        { username: 'Server1', userhost: '10.10.18.29', userport: '21', userid: 'konan', userpw: 'konan415', userdir: '', userproxy: '' },
        { username: 'Target2', userhost: 'hostText', userport: 'userPort', userid: 'lee', userpw: 1, userdir: 'dir/dir', userproxy: 'proxy' },
        { username: 'Target3', userhost: 'hostText', userport: 'userPort', userid: 'hong', userpw: 1, userdir: 'dir/dir', userproxy: 'proxy' }
      ]
    }
  },
  methods: {
    manualFtpPopup: function () {
      const name = 'manualFtp'
      const data = {
        value: name
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'manualFtp',
        data: data,
        width: 600,
        height: 700,
        parent: '',
        modal: false
      })
    },
    FileUploadPopup: function (ftpInfoItem) {
      const data = {
        value: { username: ftpInfoItem.username, userhost: ftpInfoItem.userhost, userport: ftpInfoItem.userport, userid: ftpInfoItem.userid, userpw: ftpInfoItem.userpw, userdir: ftpInfoItem.userdir, userproxy: ftpInfoItem.userproxy }
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'ManualFileUpLoad',
        data: data,
        width: 700,
        height: 700,
        parent: '',
        modal: false
      })
      console.log(ftpInfoItem)
    }
  }
}
</script>
