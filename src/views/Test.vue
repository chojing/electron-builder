<template>
  <div class="backBtn" draggable="false" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
<button v-on:click = "getKey">등록</button>
<button @click="this.newWindow">새창열기</button>
<button v-on:click = "ftpTest">ftp테스트</button>

          </div>
<div>
<h4 id = "test">{{test_}}</h4>
<h4 id = "ftpText">{{ftpText}}</h4>
</div>
<div type="text"
       class="form-control"
       @dragover.prevent
       @dragenter.prevent
       @drop.prevent="onDrop" style="border:2px solid black;border-radius:3px;padding:5px;display:inline-block">
Drag your file here
    </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
// import func from 'vue-editor-bridge'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const axios = require('../assets/js/axios.js')
const RESTAPIInfo = require('../assets/js/restapi.js').RESTAPIInfo
const AssetInfo = require('../assets/js/restapi.js').AssetInfo
const restInfo = new RESTAPIInfo()
let g_ftpSendData = {}
const g_isUpload = true
export default {
  name: 'electronTest',
  components: {
  },
  created () {
    const self = this
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
    getApiKey()
    async function getApiKey () {
      const lginInfo = {
        id: 'konan',
        pw: 'konan1',
        autologin: false
      }

      // //SearchAPI
      await axios.login(lginInfo.id, lginInfo.pw)
      const apikey = self.$store.state.apikey
      console.log('apikey')
      console.log(apikey)
      // Result
      if (apikey !== null) {
        ipcRenderer.send('login-write', lginInfo)
        // await this.$router.push('/main')
      }
    }
    Init()
    function Init () {
      // eslint-disable-next-line no-const-assign
      g_ftpSendData = new FTPSendData()

      const curFtpServer1 = new FTPServer()
      curFtpServer1.host = '10.10.18.29'
      curFtpServer1.port = '21'
      curFtpServer1.user = 'konan'
      curFtpServer1.password = 'konan415'
      curFtpServer1.serverName = 'Server1'
      if (g_isUpload == true) {
        // upload
        curFtpServer1.homeDir = ''
      } else {
        // download
        curFtpServer1.homeDir = ''
      }

      const curFtpServer2 = new FTPServer()
      curFtpServer2.host = '10.10.18.13'
      curFtpServer2.port = '21'
      curFtpServer2.user = 'konan'
      curFtpServer2.password = 'konan415'
      curFtpServer2.serverName = 'Server2'
      if (g_isUpload == true) {
        // upload
        curFtpServer2.homeDir = ''
      } else {
        // download
        curFtpServer2.homeDir = ''
      }

      const ftpSite = new FTPSite()
      ftpSite.connectionType = '2'
      ftpSite.siteName = 'konanSite'

      curFtpServer2.parentSiteName = ftpSite.siteName
      ftpSite.ftpServerList.push(curFtpServer2)

      curFtpServer1.parentSiteName = ftpSite.siteName
      ftpSite.ftpServerList.push(curFtpServer1)

      g_ftpSendData.ftpSite = ftpSite
    }
    ipcRenderer.on('getUserInfo_result', async function (event, _g_loginInfo) {
      console.log('Response GetAPIKey')
      console.log(_g_loginInfo)
      self.test_ = _g_loginInfo

      if (g_isUpload == false) {
        // Download FileTest
        const downloadObject = {
          path: '/konan/electron_test/22222222222.MXF',
          size: 0,
          fileName: '22222222222.MXF'
        }
        const downloadObject2 = {
          path: '/konan/electron_test/201906100001_002.MXF',
          size: 0,
          fileName: '201906100001_002.MXF'
        }

        g_ftpSendData.fileList.push(downloadObject)
        g_ftpSendData.fileList.push(downloadObject2)
      }

      // Create Asset
      const fileCnt = g_ftpSendData.fileList.length
      if (fileCnt <= 0) {
        console.log('No File!')
      }
      for (let i = 0; i < fileCnt; i++) {
        // ftpData : SetAsset 에서 ftpData로 들어오기 때문에 최소한의 형식을 맞춰주는 것.
        const ftpData = {
          fileName: g_ftpSendData.fileList[i].fileName
        }
        const assetInfo = new AssetInfo('test_workflowname', 'test_storagename', 0, ftpData.fileName, 0)
        ftpData.assetInfo = assetInfo

        const apikey = self.$store.state.apikey
        const result = await restInfo.CreateAsset(ftpData.assetInfo, apikey)
        // Asset PK 저장
        ftpData.assetInfo.transferjobid = result.pkvalue
        g_ftpSendData.fileList[i].key = result.pkvalue
        g_ftpSendData.fileList[i].ftpData = ftpData

        // 모든 file Create 완료
        if (i == g_ftpSendData.fileList.length - 1) {
          // Send Server ( Request FTP )
          console.log('request FTP Start')
          if (g_isUpload == true) {
            g_ftpSendData.type = 'upload'
            g_ftpSendData.targetUrl = 'test2'
            ipcRenderer.send('ftp-file-upload', g_ftpSendData) // eventName, SendData
          } else {
            g_ftpSendData.type = 'download'
            g_ftpSendData.targetUrl = 'test2'
            ipcRenderer.send('ftp-file-download', g_ftpSendData)
          }
          return true
        }
      }
    })

    ipcRenderer.on('ftp-error', function (event, ftpData) {
      console.log('error')
      // SetAsset(ftpData, g_CheckFTPPersentDic, 0)
      self.WriteText('ftpText', ftpData.errMsg)
    })

    ipcRenderer.on('ftp-message', function (event, msg) {
      self.WriteText('ftpText', msg)
    })

    ipcRenderer.on('open-dialog-result', function (event, _isCancel, _fileData) {
      if (_isCancel == true) {
        self.ftpText = '취소하였습니다.'
        return
      }
      if (_fileData === undefined) {
        self.ftpText = '파일을 가져오는 중 에러가 발생했습니다.'
        return
      }
      g_ftpSendData.fileList = _fileData
      self.PrintPath(_fileData)
    })
  },
  data () {
    return {
      test_: String,
      g_windowIndex: 0,
      ftpText: String,
      filename: '',
      fileList: []

    }
  },
  mounted () {
    this.test_ = '안녕하세요.'
    this.ftpText = 'ftp Log Text'
  },
  methods: {
    onDrop (event) {
      this.DragDropFile(event.dataTransfer.files)
    },
    DragDropFile (files) {
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          this.fileList.push(file.path)
        }
        const convertFileList = this.fileList.map(f => f)
        ipcRenderer.send('drag-file', convertFileList)
        this.fileList = []
      }
    },
    PrintPath: function (_fileData) {
      let strResult = ''
      for (var i = 0; i < _fileData.length; i++) {
        const file = _fileData[i]
        strResult += `You selected: ${file.path}` + `<br> You Size: ${file.size}` + '<br><br>'
        // strResult = 'test'
      }
      this.WriteText('ftpText', strResult)
    },
    WriteText: function (_id, text) {
      document.getElementById(_id).innerHTML = text
    },
    getKey: function () {
      ipcRenderer.send('getUserInfo')
      console.log('Request GetAPIKey')
    },
    newWindow: function () {
      const name = 'test'
      const data = {
        value: name
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'test2',
        data: data,
        width: 700,
        height: 700,
        parent: '',
        modal: false
      })
    },
    ftpTest: function () {
      console.log('test!')
    }
  }
}

</script>
