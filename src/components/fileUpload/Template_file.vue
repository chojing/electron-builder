<!-- 파일업로드 공통 템플릿-->
<template>
    <!-- @valueReturn : 자식 컴포넌트에서 emit 의 이벤트명 / "setInput" : 부모(여기)컴포넌트에서 function에 등록할 함수명 -->
    <baseDragDrop @valueReturn="DragDropResult"/>
    <div class="pro-bar mt20">
      <span :style="{width:dataPer + '%'}"></span>
      <b>{{dataPer}}%</b>
    </div>
    <div class="file-submit-box mt20 user-tel-box" :class="{hide:isTelUse}">
      <div class="box flex-box">
        <input :value="this.testValue" class="input-box flex-1" type="text" placeholder="전송 확인 문자 연락처(다중)" v-bind:isTelUse="isTelUse" disabled>
        <button @dblclick="userInfoPopup" id="user-info-btn"><i class="fas fa-phone-square-alt"></i></button>
      </div>
    </div>
    <div class="btn-box center pt20">
      <button class="btn h30">취소</button>
      <button v-on:click = "doUpload" class="btn blue h30">전송</button>
    </div>
</template>

<script>
import baseDragDrop from '@/components/main/BaseDragDrop'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const custom = require('@/assets/js/custom.js')
const FTPServer = function () {
  this.host = ''
  this.port = 0
  this.username = ''
  this.password = ''
  this.rootpath = '' // homeDir
  this.name = '' // ServerName
  this.parentSiteName = ''
}
FTPServer.prototype.getftpServerInfo = function (ftpServer) {
  ftpServer.host = this.host
  ftpServer.port = this.port
  ftpServer.username = this.username
  ftpServer.password = this.password
  ftpServer.rootpath = this.rootpath
  ftpServer.serverName = this.serverName
  ftpServer.parentSiteName = this.parentSiteName

  return ftpServer
}
const FTPSite = function () {
  this.key = 0 // DB P.K
  this.siteName = ''
  this.connectionType = '' // load balance , multi send 등..
  this.ftpServerList = [] // FTPServer[]
}
const FTPSendData = function () {
  this.title = ''
  this.comment = ''
  this.fileList = []
  this.author = ''
  // eslint-disable-next-line no-unused-expressions
  this.ftpSite // FTPSite

  // sms 정보
}
let g_ftpSendData = {}
export default {
  components: {
    baseDragDrop
  },
  props: {
    isTelUse: Boolean
  },
  created () {
    console.log('start!')
    // const self = this
    ipcRenderer.on('receiveData', this.init)
    ipcRenderer.on('ftp-result', this.ftpResult)
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: '',
      targetFtpInfo: '',
      fileList: [],
      testValue: [],
      dataPer: 0
    }
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.targetFtpInfo = data
        this.ftpSet(data)
        this.selfKey = key
        // const curFtpServer = { host: data.value.userhost, port: data.value.userport, user: data.value.userid, password: data.value.userpw, serverName: data.value.username, homeDir: data.value.userdir }
        console.log('ftp 정보 : ', custom.proxy2map(this.targetFtpInfo))
        // console.log('ftp정보', curFtpServer)
      } else if (type == 'userTelData') {
        this.testValue.push(data)
        console.log('담은 데이터', this.testValue)
      }
    },
    DragDropResult: function (value) {
      g_ftpSendData.fileList = value
      console.log(value)
    },
    doUpload: function () {
      console.log('request FTP Start')
      g_ftpSendData.type = 'upload'
      g_ftpSendData.targetUrl = ''
      ipcRenderer.send('ftp-file-upload', g_ftpSendData) // eventName, SendData
    },
    ftpResult: function (event, data) {
      console.log(data)
      this.dataPer = data.ftpData.curWorkPersent
    },
    ftpSet: function (value) {
      // eslint-disable-next-line no-const-assign
      g_ftpSendData = new FTPSendData()
      const curFtpServer1 = new FTPServer()
      curFtpServer1.host = value.host
      curFtpServer1.port = value.port
      curFtpServer1.username = value.username
      curFtpServer1.password = value.password
      curFtpServer1.name = value.name
      curFtpServer1.rootpath = value.rootpath
      const ftpSite = new FTPSite()
      ftpSite.connectionType = '1'
      ftpSite.siteName = 'konanSite'
      // curFtpServer2.parentSiteName = ftpSite.siteName
      // ftpSite.ftpServerList.push(curFtpServer2)
      curFtpServer1.parentSiteName = ftpSite.siteName
      ftpSite.ftpServerList.push(curFtpServer1)
      g_ftpSendData.ftpSite = ftpSite
    },
    userInfoPopup: function () {
      const data = {
        parentKey: this.selfKey
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'UserInfo',
        data: data,
        width: 500,
        height: 500,
        parent: '',
        modal: true
      })
    }
  }
}
</script>
