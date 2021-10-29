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
        <ul>
          <li>
            요청내역리스트 첫번째
          </li>
          <li>
            요청내역리스트 두번째
          </li>
        </ul>
      </div>
      <h4>파일(폴더) 전송</h4>
      <div class="file-drag-box mb20" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop">
        <div class="drag">

        </div>
      </div>
      <button v-on:click = "doUpload" class="btn blue allSubmit">전송</button>
    </div>
  </section>
</template>

<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
let g_ftpSendData = {}
export default {
  name: 'ManualFileUpLoad',
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
    ipcRenderer.on('ftp-result', function (event, data) {
    // ftp-log-id
      // WriteFTPData('ftp-log-id', data.ftpData)
      // g_CurftpDataServer = data.ftpServer
      console.log(data)
    })
    ipcRenderer.on('receiveData', this.init)
    ipcRenderer.on('open-dialog-result', this.DragDropFile_Result)
  },
  data () {
    return {
      g_windowIndex: 0,
      targetNameValue: '',
      fileList: []
    }
  },
  methods: {
    init: function (event, key, data) {
      this.targetNameValue = data.value
    },
    onDrop (event) {
      console.log('dragTest!')
      this.DragDropFile(event.dataTransfer.files)
    },
    DragDropFile (files) {
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          this.fileList.push(file.path)
          console.log(this.fileList)
        }
        const convertFileList = this.fileList.map(f => f)
        ipcRenderer.send('drag-file', convertFileList)
        this.fileList = []
      }
    },
    DragDropFile_Result (event, _isCancel, _fileData) {
      if (_isCancel == true) {
        // self.ftpText = '취소하였습니다.'
        return
      }
      if (_fileData === undefined) {
        // self.ftpText = '파일을 가져오는 중 에러가 발생했습니다.'
        return
      }
      g_ftpSendData.fileList = _fileData
      //   console.log(_fileData)
      // self.PrintPath(_fileData)
    },
    doUpload: function () {
      console.log('request FTP Start')
      g_ftpSendData.type = 'upload'
      g_ftpSendData.targetUrl = ''
      ipcRenderer.send('ftp-file-upload', g_ftpSendData) // eventName, SendData
    }
  }
}
</script>
