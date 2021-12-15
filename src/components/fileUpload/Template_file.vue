<!-- 파일업로드 공통-->
<template>
    <!-- @valueReturn : 자식 컴포넌트에서 emit 의 이벤트명 / "DragDropResult" : 부모(여기)컴포넌트에서 function에 등록할 함수명 -->
    <baseDragDrop @valueReturn="DragDropResult" ref="baseDragDrop" :isUploading="isUploading" :isUploadComplete="isUploadComplete"/>
    <div v-show="!isSite">
      <div class="pro-bar mt15">
        <span :style="{width:dataPer + '%'}"></span>
        <b>{{dataPer}}%   ({{fileIndex}} / {{fileTotal}})</b>
      </div>
      <div class="pro-bar" style="margin-top: 4px !important;">
        <span :style="{width:totalDataPer + '%'}"></span>
        <b>{{totalDataPer}}%</b>
      </div>
    </div>
    <div class="file-submit-box mt20 user-tel-box" :class="{hide:!isTelUse}">
      <div class="box flex-box">
        <input :value="this.telValue.map((obj) => obj['name'])" class="input-box flex-1"
               type="text" placeholder="전송 확인 문자 연락처(다중)" v-bind:isTelUse="isTelUse" disabled>
        <button @click="userInfoPopup" id="user-info-btn"><i class="fas fa-phone-square-alt"></i></button>
      </div>
    </div>
    <div class="btn-box center pt20">
      <button v-on:click = "doUpload" class="btn blue h30" v-show="!isUploading&&!isUploadComplete">전송</button>
      <button v-on:click = "doCancel" class="btn h30" v-show="isUploading&&!isUploadComplete">전송 취소</button>
      <button v-on:click = "doClose" class="btn h30" v-show="!isUploading" ref="closeBtn">닫기</button>
    </div>
</template>

<script>
import baseDragDrop from '@/components/main/BaseDragDrop'
// import ElectronLog from 'electron-log'
const { ipcRenderer, axios, custom } = require('@/assets/js/include.js')
// const log = require(ElectronLog)
const FTPServer = function () {
  this.ftpserverid = 0
  this.host = ''
  this.port = 0
  this.username = ''
  this.password = ''
  this.ogRootpath = ''
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
let transfer = {}
let g_ftpSendData = {}
export default {
  components: {
    baseDragDrop
  },
  props: {
    isTelUse: Boolean,
    isSite: Boolean
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
    ipcRenderer.on('ftp-result', this.ftpResult)
    ipcRenderer.on('ftp-error', this.ftpError)
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: '',
      c_ftpmode: [],
      targetFtpInfo: '',
      fileList: [],
      telValue: [],
      dataPer: 0,
      totalDataPer: 0,
      fileIndex: 0,
      fileTotal: 0,
      transferid: null,
      g_curWindowKey: '',
      isUploading: false,
      isUploadComplete: false,
      isCancel: false,
      isResponse: false,
      tempCurrentPercent: -1
    }
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.targetFtpInfo = data
        this.selfKey = key
        this.g_curWindowKey = key
        axios.getAsyncAxios('/v2/ftpserver/code', {}, (response) => {
          this.c_ftpmode = response.data.c_ftpmode
          this.ftpSet(data.site, data.serverlist)
        })
        // const curFtpServer = { host: data.value.userhost, port: data.value.userport, user: data.value.userid, password: data.value.userpw, serverName: data.value.username, homeDir: data.value.userdir }
        console.log('ftp 정보 : ', custom.proxy2map(this.targetFtpInfo))
      } else if (type == 'userTelData') { /* 전송 확인 문자 연락처 팝업에서 전화번호 추가 후 logic */
        if (data.length === 0) {
          this.telValue = []
        }
        data.forEach(userTelData => {
          if (userTelData !== '') {
            if (this.telValue.length !== 0) {
              var memberid = this.telValue.map((obj) => obj['memberid'])
              if (memberid.indexOf(userTelData.memberid) === -1) {
                this.telValue.push(userTelData)
              } else if (memberid.indexOf(userTelData.memberid) !== -1) {
                this.telValue = []
                this.telValue.push(userTelData)
              }
            } else if (this.telValue.length === 0) {
              this.telValue.push(userTelData)
            }
          }
        })
        // console.log('담은 데이터', this.telValue)
      } else if (type == 'isFtpSiteCancel') { /* ftpSite 전송 진행 팝업에서 전송취소를 누른 후 logic */
        // transfer_tb insert data
        transfer.status = 4000
        axios.putAsyncAxios('/v2/transfers/' + this.transferid, JSON.stringify(transfer), null, (response) => {
          // console.log('isCancel Success Put : ', response)
        })
        this.isUploading = false
        this.$refs.closeBtn.innerText = this.isUploadComplete ? '전송완료' : '닫기'
      }
    },
    DragDropResult: function (value) {
      g_ftpSendData.fileList = value
      g_ftpSendData.title = this.$refs.baseDragDrop.$refs.title.value
      g_ftpSendData.comment = this.$refs.baseDragDrop.$refs.comment.value
      // console.log('DragDropResult', include.custom.proxy2map(value))
    },
    doUpload: function () {
      let self = this
      this.transferid = null
      self.isCancel = false
      console.log('request FTP Start')
      if (g_ftpSendData.title == '') {
        ipcRenderer.send('alert', '전송제목을 입력해주세요.')
      } else if (Object.keys(g_ftpSendData.fileList).length === 0) {
        ipcRenderer.send('alert', '전송할 파일(폴더)를 선택해주세요.')
      } else {
        g_ftpSendData.type = 'upload'
        // ipcRenderer.send('ftp-file-upload', include.custom.proxy2map(g_ftpSendData)) // eventName, SendData
        let rootpathTitle = g_ftpSendData.title.replace(/[^a-z|A-Z|0-9|ㄱ-ㅎ|가-힣|.]/g, '_')
        for (let idx in g_ftpSendData.ftpSite.ftpServerList) {
          let server = g_ftpSendData.ftpSite.ftpServerList[idx]
          server.rootpath = server.ogRootpath
          if (this.targetFtpInfo.nodepath) {
            if (this.targetFtpInfo.nodepath.indexOf('/') !== -1) {
              let nodepathStr = this.targetFtpInfo.nodepath.substr(1)
              server.rootpath = server.rootpath + nodepathStr + '/' + rootpathTitle
            }
          } else {
            server.rootpath = server.rootpath + rootpathTitle
          }
          if (server.rootpath.indexOf('//') != -1) {
            server.rootpath = server.rootpath.replace('//', '/')
          }
          // console.log('server.rootpath : ', server.rootpath)
        }

        // transfer_tb insert data
        transfer = {}
        transfer.userid = this.$store.state.username
        transfer.filepath = ''
        transfer.status = 1000
        transfer.transfername = g_ftpSendData.title
        transfer.trasnferrequest = g_ftpSendData.comment
        transfer.filesize = 0
        for (let idx in g_ftpSendData.fileList) {
          let item = g_ftpSendData.fileList[idx]
          transfer.filesize += item.size
        }
        if (this.targetFtpInfo.nodeid) {
          transfer.nodeid = this.targetFtpInfo.nodeid
        }

        // 전송내역 추가
        axios.postAsyncAxios('/v2/transfers', JSON.stringify(transfer), null, (response) => {
          // console.log('post : ', response)
          self.transferid = response.data.transferid
          g_ftpSendData.clientData = {}
          g_ftpSendData.clientData.transferid = response.data.transferid
          if (self.isSite) {
            g_ftpSendData.targetUrl = 'FtpSiteTransferProgress'
            g_ftpSendData.clientData.parentKey = this.selfKey
            g_ftpSendData.clientData.nodeid = this.targetFtpInfo.nodeid
          }
          ipcRenderer.send('ftp-file-upload', custom.proxy2map(g_ftpSendData)) // eventName, SendData

          // 전송서버내역 추가
          console.log('Template_file', g_ftpSendData)
          for (let server of g_ftpSendData.ftpSite.ftpServerList) {
            axios.postAsyncAxios('/v2/transfers/' + this.transferid + '/ftpservers/' + server.ftpserverid, null, null, (response) => {
            })
          }
          for (let idx in g_ftpSendData.fileList) {
            let item = g_ftpSendData.fileList[idx]
            // transfer_file_tb insert data
            const transferFile = {}
            transferFile.transferid = this.transferid
            transferFile.filesize = item.size
            for (let idy in g_ftpSendData.ftpSite.ftpServerList) {
              let server = g_ftpSendData.ftpSite.ftpServerList[idy]
              transferFile.filepath = server.rootpath
            }
            if (item.fileName.indexOf('/') !== -1) {
              let nameStr = item.fileName.split('/')
              for (let i = 1; i < nameStr.length; i++) {
                if (i != nameStr.length - 1) {
                  transferFile.filepath += ('/' + nameStr[i])
                } else if (i == (nameStr.length - 1)) {
                  transferFile.filepath += '/'
                }
              }
              transferFile.filename = nameStr[nameStr.length - 1]
            }
            // 전송상세내역 추가
            axios.postAsyncAxios('/v2/transferfiles', JSON.stringify(transferFile), null, (response) => {})
          }
        })
        console.log('ftpserverid : ', this.targetFtpInfo.ftpserverid)
        this.isUploading = true
      }
    },
    ftpResult: function (event, data) {
      console.log('ftpResult', data)
      this.dataPer = data.ftpData.curWorkPersent // 현재 파일 업로드 진행 퍼센트
      this.totalDataPer = data.ftpData.totalWorkSize_Percent // 전체 파일 업로드 진행 퍼센트
      this.fileIndex = data.ftpData.workIndex + 1 // 현재 진행 중인 파일 인덱스
      this.fileTotal = g_ftpSendData.fileList.length // 전체 파일 진행 개수

      // transfer_tb insert data
      transfer.status = 2000

      if (!data.ftpData.isTotalComplete) {
        if (this.tempCurrentPercent !== parseInt(data.ftpData.totalWorkSize_Percent)) {
          this.tempCurrentPercent = parseInt(data.ftpData.totalWorkSize_Percent)
          transfer.status += parseInt(data.ftpData.totalWorkSize_Percent)
          if (data.ftpData.totalWorkSize_Percent == 100) {
            transfer.status = 3000
          }

          // console.log(this.transferid)
          if ((!this.isResponse && this.transferid != null && !this.isCancel) || data.ftpData.totalWorkSize_Percent == 100) {
            this.isResponse = true
            axios.putAsyncAxios('/v2/transfers/' + this.transferid, JSON.stringify(transfer), null, (response) => {
              // console.log('Success Put : ', response)
              this.isResponse = false
            })
          }
        }
      } else if (data.ftpData.isTotalComplete) {
        this.isUploadComplete = true
        this.isUploading = false
        this.$refs.closeBtn.innerText = this.isUploadComplete ? '전송완료' : '닫기'
      }

      if (data.ftpData.isCancel == true) {
        console.log('Cancel Complete')
        transfer.status = 4000
        axios.putAsyncAxios('/v2/transfers/' + this.transferid, JSON.stringify(transfer), null, (response) => {
        //   console.log('isCancel Success Put : ', response)
        })
        this.isUploading = false
        this.$refs.closeBtn.innerText = this.isUploadComplete ? '전송완료' : '닫기'
      }
    },
    ftpSet: function (site, serverlist) {
      // eslint-disable-next-line no-const-assign
      g_ftpSendData = new FTPSendData()
      const ftpSite = new FTPSite()
      if (site) {
        ftpSite.siteName = site.name
        ftpSite.connectionType = site.mode_code
      } else {
        ftpSite.siteName = 'konanSite'
        ftpSite.connectionType = 'sequential'
      }
      for (let server of serverlist) {
        // activeIp:
        // ftp가 active 일 경우, 반드시 입력되어야 하는 값.
        // active 모드인데 해당 ip값이 없을 경우, 에러
        // 클라이언트측의 ip 이며, 127.0.0.1은 사용불가 (서버측 IP로 인식되어버림)
        // curFtpServer2.parentSiteName = ftpSite.siteName
        // ftpSite.ftpServerList.push(curFtpServer2)
        const curFtpServer1 = new FTPServer()
        curFtpServer1.ftpserverid = server.ftpserverid
        curFtpServer1.host = server.host
        curFtpServer1.port = server.port
        curFtpServer1.username = server.username
        curFtpServer1.password = server.password
        curFtpServer1.name = server.name
        curFtpServer1.ogRootpath = server.rootpath
        curFtpServer1.rootpath = server.rootpath
        if (custom.code.valueToCode(this.c_ftpmode, server.mode) === 'active') {
          curFtpServer1.passive = false // passive : true / active : false
        } else {
          curFtpServer1.passive = true // 모드 : 기본, 수동 분기될 시 변경해야함
        }
        curFtpServer1.parentSiteName = ftpSite.siteName
        curFtpServer1.activeIp = 'default'
        ftpSite.ftpServerList.push(curFtpServer1)

        // const curFtpServer2 = new FTPServer()
        // curFtpServer2.ftpserverid = server.ftpserverid
        // curFtpServer2.host = '10.10.18.13'
        // curFtpServer2.port = 21
        // curFtpServer2.username = 'konan'
        // curFtpServer2.password = 'konan415'
        // curFtpServer2.name = 'jytest2'
        // curFtpServer2.rootpath = server.rootpath
        // curFtpServer2.passive = true // passive : true / active : false
        // curFtpServer2.parentSiteName = ftpSite.siteName
        // curFtpServer2.activeIp = ''
        // ftpSite.ftpServerList.push(curFtpServer2)
      }
      g_ftpSendData.ftpSite = ftpSite
    },
    doCancel: function () {
      console.log('cancel Test!')
      let self = this
      self.isCancel = true
      let isFileDelete = true
      let cancelType = 'all' // all / path

      let cancelInfo = {
        cancelType: cancelType,
        cancelConnectionList: g_ftpSendData.ftpSite.ftpServerList,
        transferid: this.transferid,
        isDelete: isFileDelete,
        path: undefined // type 이 path일 경우만 기재
      }
      ipcRenderer.send('ftp-cancel', cancelInfo)
      console.log('cancel request!')
    },
    doClose: function () {
      if (this.isUploading == false) {
        ipcRenderer.send('closeWindow', this.g_curWindowKey)
      }
    },
    userInfoPopup: function () {
      const data = {}
      data.parentKey = this.selfKey
      let item = []
      this.telValue.forEach(userTelData => {
        let users = {}
        users.memberid = userTelData.memberid
        item.push(users)
      })
      data.telValue = item
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'UserInfo',
        data: data,
        width: 500,
        height: 500,
        parent: '',
        modal: true
      })
    },
    ftpError: function (event, errMsg) {
      console.log(errMsg)
      let msg = ''
      this.isUploading = false
      if (errMsg.code === 530) {
        msg = '로그인한 계정 / 비밀번호를 확인해주세요'
        ipcRenderer.send('alert', msg)
      } else if (errMsg.code == 'EHOSTUNREACH') {
        msg = 'FTP 서버와 연결할 수 없습니다.'
        ipcRenderer.send('alert', msg)
      } else if (errMsg.code == 600) {
        msg = 'FTP 경로에 문제가 발생했습니다.'
        ipcRenderer.send('alert', msg)
      } else if (errMsg.code == 'ECONNABORTED') {
        // 잘못된 acitve ip 의심
        msg = 'FTP 서버와 연결이 끊어졌습니다.'
        ipcRenderer.send('alert', msg)
      } else if (errMsg.code == 'ENOTFOUND') {
        msg = '인식할 수 없는 HOST입니다.\n FTP 서버의 HOST를 확인해주세요.'
        ipcRenderer.send('alert', msg)
      } else if (errMsg.code == 'ERR_SOCKET_BAD_PORT') {
        msg = 'PORT번호는 0부터 65535까지의 범위의 숫자로 되어야합니다.\n FTP 서버의 PORT번호를 확인해주세요.'
        ipcRenderer.send('alert', msg)
      } else {
        console.log('errCode : ', errMsg.code)
        ipcRenderer.send('WriteLog', errMsg.code)
        ipcRenderer.send('alert', errMsg.message)
      }

      transfer.status = 4000
      axios.putAsyncAxios('/v2/transfers/' + this.transferid, JSON.stringify(transfer), null, (response) => {
        // console.log('isCancel Success Put : ', response)
      })
    }
  }
}
</script>
