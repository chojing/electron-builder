<template>
  <section class="file-container pb40">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <h4>전송제목</h4>
      <div class="file-tti-box mb40">
        <input class="input-box" type="text" value="">
      </div>
      <h4>Optional(요청내역)</h4>
      <div class="file-list-box mb20">
        <textarea></textarea>
      </div>

      <!-- @valueReturn : 자식 컴포넌트에서 emit 의 이벤트명 / "setInput" : 부모(여기)컴포넌트에서 function에 등록할 함수명 -->
<baseDragDrop @valueReturn="DragDropResult"/>

      <div class="pro-bar mt20">
        <span :style="{width:dataPer + '%'}"></span>
        <b>{{dataPer}}%</b>
      </div>
      <button v-on:click = "doUpload" class="btn blue allSubmit">전송</button>
    </div>
  </section>
</template>

<script>
import baseDragDrop from '@/components/main/BaseDragDrop'

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

let g_ftpSendData = {}
export default {
  name: 'ManualFileUpLoad',
  components: {
    baseDragDrop
  },
  created () {
    console.log('start!')
    // const self = this
    function FTPServer () {
      this.host = ''
      this.port = 0
      this.user = ''
      this.password = ''
      this.homeDir = ''
      this.serverName = ''
      this.parentSiteName = ''
    }
    FTPServer.prototype.getftpServerInfo = function (ftpServer) {
      ftpServer.host = this.host
      ftpServer.port = this.port
      ftpServer.user = this.user
      ftpServer.password = this.password
      ftpServer.homeDir = this.homeDir
      ftpServer.serverName = this.serverName
      ftpServer.parentSiteName = this.parentSiteName

      return ftpServer
    }
    function FTPSite () {
      this.key = 0 // DB P.K
      this.siteName = ''
      this.connectionType = '' // load balance , multi send 등..
      this.ftpServerList = [] // FTPServer[]
    }

    function FTPSendData () {
      this.title = ''
      this.comment = ''
      this.fileList = []
      this.author = ''
      // eslint-disable-next-line no-unused-expressions
      this.ftpSite // FTPSite

      // sms 정보
    }
    testSite()
    function testSite () {
      // eslint-disable-next-line no-const-assign
      g_ftpSendData = new FTPSendData()

      const curFtpServer1 = new FTPServer()
      curFtpServer1.host = '10.10.18.29'
      curFtpServer1.port = '21'
      curFtpServer1.user = 'konan'
      curFtpServer1.password = 'konan415'
      curFtpServer1.serverName = 'Server1'
      curFtpServer1.homeDir = ''

      const curFtpServer2 = new FTPServer()
      curFtpServer2.host = '10.10.18.13'
      curFtpServer2.port = '21'
      curFtpServer2.user = 'konan'
      curFtpServer2.password = 'konan415'
      curFtpServer2.serverName = 'Server2'
      curFtpServer2.homeDir = ''

      const ftpSite = new FTPSite()
      ftpSite.connectionType = '1'
      ftpSite.siteName = 'konanSite'

      curFtpServer2.parentSiteName = ftpSite.siteName
      // ftpSite.ftpServerList.push(curFtpServer2)

      curFtpServer1.parentSiteName = ftpSite.siteName
      ftpSite.ftpServerList.push(curFtpServer1)

      g_ftpSendData.ftpSite = ftpSite
    }

    ipcRenderer.on('receiveData', this.init)
    ipcRenderer.on('ftp-result', this.ftpResult)
  },
  data () {
    return {
      g_windowIndex: 0,
      targetNameValue: '',
      fileList: [],
      dataPer: 0
    }
  },
  methods: {
    init: function (event, key, data) {
      this.targetNameValue = data.value
    },
    DragDropResult: function (value) {
      if (value === '취소하였습니다.') {
        return
      }
      if (value === '파일을 가져오는 중 에러가 발생했습니다.') {
        return
      }
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
    }
  }
}
</script>
