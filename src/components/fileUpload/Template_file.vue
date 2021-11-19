<!-- 파일업로드 공통-->
<template>
    <!-- @valueReturn : 자식 컴포넌트에서 emit 의 이벤트명 / "DragDropResult" : 부모(여기)컴포넌트에서 function에 등록할 함수명 -->
    <baseDragDrop @valueReturn="DragDropResult" ref="baseDragDrop" :isUploading="isUploading" :isUploadComplete="isUploadComplete"/>
    <div class="pro-bar mt15">
      <span :style="{width:dataPer + '%'}"></span>
      <b>{{dataPer}}%   ({{fileIndex}} / {{fileTotal}})</b>
    </div>
    <div class="pro-bar" style="margin-top: 4px !important;">
      <span :style="{width:totalDataPer + '%'}"></span>
      <b>{{totalDataPer}}%</b>
    </div>
    <div class="file-submit-box mt20 user-tel-box" :class="{hide:!isTelUse}">
      <div class="box flex-box">
        <input :value="this.telValue" class="input-box flex-1" type="text" placeholder="전송 확인 문자 연락처(다중)" v-bind:isTelUse="isTelUse" disabled>
        <button @dblclick="userInfoPopup" id="user-info-btn"><i class="fas fa-phone-square-alt"></i></button>
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
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const axios = require('@/assets/js/axios.js')
const custom = require('@/assets/js/include.js')
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
let g_CurftpDataServer
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
    ipcRenderer.on('ftp-error', this.ftpError)
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: '',
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
      isResponse: false,
      tempCurrentPercent: -1
    }
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.targetFtpInfo = data
        this.ftpSet(data)
        this.selfKey = key
        this.g_curWindowKey = key
        // const curFtpServer = { host: data.value.userhost, port: data.value.userport, user: data.value.userid, password: data.value.userpw, serverName: data.value.username, homeDir: data.value.userdir }
        console.log('ftp 정보 : ', custom.proxy2map(this.targetFtpInfo))
      } else if (type == 'userTelData') {
        this.telValue.push(data)
        // console.log('담은 데이터', this.telValue)
      }
    },
    DragDropResult: function (value) {
      g_ftpSendData.fileList = value
      g_ftpSendData.title = this.$refs.baseDragDrop.$refs.title.value
      g_ftpSendData.comment = this.$refs.baseDragDrop.$refs.comment.value
      // console.log('DragDropResult', custom.proxy2map(value))
    },
    doUpload: function () {
      this.transferid = null
      console.log('request FTP Start')
      if (Object.keys(g_ftpSendData.fileList).length === 0) {
        alert('전송할 파일(폴더)를 선택해주세요.')
      } else {
        g_ftpSendData.type = 'upload'
        g_ftpSendData.targetUrl = ''
        // ipcRenderer.send('ftp-file-upload', custom.proxy2map(g_ftpSendData)) // eventName, SendData

        // transfer_tb insert data
        const transfer = {}
        transfer.isfolder = false
        transfer.userid = this.$store.state.userid
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
          this.transferid = response.data.transferid
          ipcRenderer.send('ftp-file-upload', custom.proxy2map(g_ftpSendData)) // eventName, SendData

          // 전송서버내역 추가
          axios.postAsyncAxios('/v2/transfers/' + this.transferid + '/ftpservers/' + this.targetFtpInfo.ftpserverid, null, null, (response) => {})

          for (let idx in g_ftpSendData.fileList) {
            let item = g_ftpSendData.fileList[idx]
            // transfer_file_tb insert data
            const transferFile = {}
            transferFile.transferid = this.transferid
            transferFile.filename = item.fileName
            transferFile.filesize = item.size
            // 전송상세내역 추가
            axios.postAsyncAxios('/v2/transferfiles', JSON.stringify(transferFile), null, (response) => {})
          }
        })
        console.log('ftpserverid : ', this.targetFtpInfo.ftpserverid)
        this.isUploading = true
      }
    },
    ftpResult: function (event, data) {
      // console.log('ftpResult', data)
      this.dataPer = data.ftpData.curWorkPersent // 현재 파일 업로드 진행 퍼센트
      this.totalDataPer = data.ftpData.totalWorkSize_Percent // 전체 파일 업로드 진행 퍼센트
      this.fileIndex = data.ftpData.workIndex + 1 // 현재 진행 중인 파일 인덱스
      this.fileTotal = g_ftpSendData.fileList.length // 전체 파일 진행 개수

      // transfer_tb insert data
      const transfer = {}
      transfer.isfolder = false
      transfer.userid = this.$store.state.userid
      transfer.filepath = ''
      transfer.status = 2000
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

      if (!data.ftpData.isTotalComplete) {
        if (this.tempCurrentPercent !== parseInt(data.ftpData.totalWorkSize_Percent)) {
          this.tempCurrentPercent = parseInt(data.ftpData.totalWorkSize_Percent)
          transfer.status += parseInt(data.ftpData.totalWorkSize_Percent)
          if (data.ftpData.totalWorkSize_Percent == 100) {
            transfer.status = 3000
          }

          console.log(this.transferid)
          if ((!this.isResponse && this.transferid != null) || data.ftpData.totalWorkSize_Percent == 100) {
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
      curFtpServer1.passive = true // passive : true / active : false

      // activeIp:
      // ftp가 active 일 경우, 반드시 입력되어야 하는 값.
      // active 모드인데 해당 ip값이 없을 경우, 에러
      // 클라이언트측의 ip 이며, 127.0.0.1은 사용불가 (서버측 IP로 인식되어버림)
      curFtpServer1.activeIp = ''

      const ftpSite = new FTPSite()
      ftpSite.connectionType = '1'
      ftpSite.siteName = 'konanSite'
      // curFtpServer2.parentSiteName = ftpSite.siteName
      // ftpSite.ftpServerList.push(curFtpServer2)
      curFtpServer1.parentSiteName = ftpSite.siteName
      ftpSite.ftpServerList.push(curFtpServer1)
      g_ftpSendData.ftpSite = ftpSite

      g_CurftpDataServer = curFtpServer1
    },
    doCancel: function () {
      console.log('cancel Test!')

      let isFileDelete = true
      let cancelConnectionList = [] // ServerName
      cancelConnectionList.push(g_CurftpDataServer)
      let cancelType = 'all' // all / path

      let cancelInfo = {
        cancelType: cancelType,
        cancelConnectionList: cancelConnectionList,
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
    },
    ftpError: function (event, errMsg) {
      console.log(errMsg)
      let msg = ''
      this.isUploading = false
      if (errMsg.code === 530) {
        msg = '로그인한 계정 / 비밀번호를 확인해주세요'
        alert(msg)
      } else if (errMsg.code == 'EHOSTUNREACH') { msg = 'FTP 서버와 연결할 수 없습니다.' } else {
        alert(errMsg.message)
      }
    }
  }
}
</script>
