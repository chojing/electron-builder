<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb15">전송 진행사항</h4>
      <div class="send-box h480">
        <table>
          <colgroup>
            <col width="20%">
            <col width="auto">
            <col width="140px">
          </colgroup>
          <thead>
          <tr>
            <th>서버명</th>
            <th>파일명</th>
            <th>전송상태</th>
          </tr>
          </thead>
          <tbody>
            <templateProgress :ftpResultData="ftpResultData"/>
          </tbody>
        </table>
      </div>
    </div>
    <div class="btn-box center pt20">
      <button v-on:click = "doCancel(true)" class="btn h30" v-show="isUploading&&!isUploadComplete">전송취소</button>
      <button v-on:click = "doClose" class="btn h30" v-show="!isUploading&&isUploadComplete">전송완료</button>
    </div>
  </section>
</template>r554

<script>
import templateProgress from '@/components/main/Template_ftpSiteTransferProgress_list'
const { axios, ipcRenderer, custom } = require('@/assets/js/include.js')
let serverResultList = {}
let transfer = {}
export default {
  components: {
    templateProgress
  },
  data () {
    return {
      g_windowIndex: 0,
      parentKey: '',
      g_curWindowKey: '',
      g_ftpSendData: {},
      ftpResultData: [],
      transferid: null,
      nodeid: null,
      isRoundRobin: false,
      isUploading: true,
      isUploadComplete: false,
      isResponse: false,
      isCancel: false,
      tempCurrentPercent: -1
    }
  },
  created () {
    let self = this
    ipcRenderer.on('receiveData', self.init)
    ipcRenderer.on('ftp-result', self.ftpResult)
    ipcRenderer.on('ftp-error', this.ftpError)
  },
  methods: {
    init: function (event, key, data, type) {
      this.parentKey = data.g_ftpSendData.clientData.parentKey
      this.g_curWindowKey = key
      this.g_ftpSendData = data.g_ftpSendData
      // for (let idx in data.g_ftpSendData.ftpSite.ftpServerList) { // 서버별로 정렬
      //   let server = data.g_ftpSendData.ftpSite.ftpServerList[idx]
      //   serverResultList[server.name] = { totalPercent: 0 }
      //   for (let idy in data.g_ftpSendData.fileList) {
      //     let item = data.g_ftpSendData.fileList[idy]
      //     let obj = {}
      //     obj.ftpserverid = server.ftpserverid
      //     obj.ftpservername = server.name
      //     obj.fileName = item.fileName
      //     obj.dataPer = 0
      //     // console.log('obj : ', obj)
      //     this.ftpResultData.push(obj)
      //   }
      // }
      for (let idy in data.g_ftpSendData.fileList) { // 파일명별로 정렬
        let item = data.g_ftpSendData.fileList[idy]
        for (let idx in data.g_ftpSendData.ftpSite.ftpServerList) {
          let server = data.g_ftpSendData.ftpSite.ftpServerList[idx]
          serverResultList[server.name] = { totalPercent: 0 }
          let obj = {}
          obj.ftpserverid = server.ftpserverid
          obj.ftpservername = server.name
          obj.fileName = item.fileName
          obj.dataPer = 0
          // console.log('obj : ', obj)
          this.ftpResultData.push(obj)
        }
      }
      this.transferid = data.g_ftpSendData.clientData.transferid
      this.nodeid = data.g_ftpSendData.clientData.nodeid
      if (data.g_ftpSendData.ftpSite.connectionType === 'roundrobin') {
        this.isRoundRobin = true
      }
      // console.log('data', data)

      // start FTP
      ipcRenderer.send('ftp-file-upload-start')
    },
    ftpResult: function (event, data) {
      // console.log('ftpResult', data)
      let self = this
      for (let idx in self.ftpResultData) {
        let item = self.ftpResultData[idx]
        if (item.fileName == data.ftpData.fileName && item.ftpserverid == data.ftpServer.ftpserverid) {
          item.dataPer = data.ftpData.curWorkPersent
        }
      }
      // transfer_tb insert data
      transfer.userid = self.$store.state.username
      transfer.transfertype = self.g_ftpSendData.ftpSite.connectionType
      transfer.filepath = ''
      transfer.status = 2000
      if (data.ftpData.startTime === data.ftpData.curTime) {
        transfer.transferstarttime = custom.get_now_yyyymmddhhiiss()
      }
      transfer.transfername = self.g_ftpSendData.title
      transfer.trasnferrequest = self.g_ftpSendData.comment
      transfer.filesize = 0
      for (let idx in self.g_ftpSendData.fileList) {
        let item = self.g_ftpSendData.fileList[idx]
        transfer.filesize += item.size
      }
      if (this.nodeid) {
        transfer.nodeid = self.nodeid
      }

      if (!self.isRoundRobin) {
        serverResultList[data.ftpServer.name].totalPercent = data.ftpData.totalWorkSize_Percent
        let total = 0
        for (var idx in serverResultList) {
          total += parseInt(serverResultList[idx].totalPercent)
        }

        let sitePercent = 0
        if (total === 0) {
          sitePercent = 0
        } else {
          sitePercent = total / self.g_ftpSendData.ftpSite.ftpServerList.length
        }
        if (!data.ftpData.isTotalComplete || Math.floor(sitePercent) !== 100) {
          if (self.tempCurrentPercent !== Math.floor(sitePercent)) {
            self.tempCurrentPercent = Math.floor(sitePercent)
            transfer.status += Math.floor(sitePercent)
            if (sitePercent == 100) {
              transfer.status = 3000
              transfer.transferendtime = custom.get_now_yyyymmddhhiiss()
              for (let server of self.g_ftpSendData.ftpSite.ftpServerList) { // transferftp_tb에 status 업데이트
                const param = {}
                param.status = 3000
                axios.putAsyncAxios('/v2/transfers/' + self.transferid + '/ftpservers/' + server.ftpserverid, null, param, (response) => {
                })
              }
            }

            // console.log('transfer.status : ', transfer.status, ' sitePercent : ', sitePercent)
            if ((!self.isResponse && self.transferid != null && !self.isCancel) || Math.floor(sitePercent) == 100) {
              self.isResponse = true
              axios.putAsyncAxios('/v2/transfers/' + self.transferid, JSON.stringify(transfer), null, (response) => {
                // console.log('Success Put : ', response)
                self.isResponse = false
              })
            }
          }
        } else if (data.ftpData.isTotalComplete && Math.floor(sitePercent) === 100) {
          self.isUploadComplete = true
          self.isUploading = false
        }
      } else if (self.isRoundRobin) { // connectionType이 라운드로빈일 경우
        if (!data.ftpData.isTotalComplete) {
          if (self.tempCurrentPercent !== parseInt(data.ftpData.totalWorkSize_Percent)) {
            self.tempCurrentPercent = parseInt(data.ftpData.totalWorkSize_Percent)
            transfer.status += parseInt(data.ftpData.totalWorkSize_Percent)
            if (data.ftpData.totalWorkSize_Percent == 100) {
              transfer.status = 3000
              transfer.transferendtime = custom.get_now_yyyymmddhhiiss()
              let successFtpServerid = data.ftpServer.ftpserverid
              const param = {}
              param.status = 3000
              axios.putAsyncAxios('/v2/transfers/' + self.transferid + '/ftpservers/' + successFtpServerid, null, param, (response) => {
              })
            }

            // console.log(this.transferid)
            if ((!self.isResponse && self.transferid != null && !self.isCancel) || data.ftpData.totalWorkSize_Percent == 100) {
              self.isResponse = true
              axios.putAsyncAxios('/v2/transfers/' + self.transferid, JSON.stringify(transfer), null, (response) => {
                // console.log('Success Put : ', response)
                self.isResponse = false
              })
            }
          }
        } else if (data.ftpData.isTotalComplete) {
          self.isUploadComplete = true
          self.isUploading = false
        }
      }
    },
    doCancel: function (flag) {
      console.log('cancel Test!')
      let self = this
      self.isCancel = true
      let isFileDelete = true
      let cancelType = 'all' // all / path

      let cancelInfo = {
        cancelType: cancelType,
        cancelConnectionList: self.g_ftpSendData.ftpSite.ftpServerList,
        transferid: this.transferid,
        isDelete: isFileDelete,
        path: undefined // type 이 path일 경우만 기재
      }
      console.log('cancel info : ', custom.proxy2map(cancelInfo))
      ipcRenderer.send('ftp-cancel', custom.proxy2map(cancelInfo))
      console.log('cancel request!')
      if (flag) {
        ipcRenderer.send('sendData', self.parentKey, null, 'isFtpSiteCancel')
        ipcRenderer.send('closeWindow', self.g_curWindowKey)
      } else if (!flag) {
        let msg = '전송 실패하였습니다.'
        ipcRenderer.send('alert', msg)
      }
    },
    doClose: function () {
      let self = this
      if (self.isUploading == false && self.isUploadComplete == true) {
        ipcRenderer.send('closeWindow', self.g_curWindowKey)
        ipcRenderer.send('closeWindow', self.parentKey)
      }
    },
    ftpError: function (event, errMsg) {
      console.log(errMsg)
      let msg = ''
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
        if (errMsg.message !== undefined && !this.isRoundRobin) {
          ipcRenderer.send('alert', errMsg.message)
        } else if (errMsg.code !== undefined || errMsg.code !== null) {
          ipcRenderer.send('WriteLog', errMsg.code)
        }
      }
      let errLogMsg = ''
      if (errMsg.message !== undefined) {
        errLogMsg = 'ftpErrorFTPInfoLog ::: host : ' + errMsg.ftpData.host + ' name : ' + errMsg.ftpData.name +
        ' rootPath : ' + errMsg.ftpData.rootpath + ' message : ' + errMsg.message
        ipcRenderer.send('WriteLog', errLogMsg)
      }
      let self = this

      if (!self.isRoundRobin) { // 라운드로빈이 아닐 경우 transfer_tb에 status 실패로 업데이트
        if (errMsg.message !== undefined) {
          self.doCancel(false)
          for (let server of self.g_ftpSendData.ftpSite.ftpServerList) { // transferftp_tb에 status 업데이트
            const param = {}
            param.status = 4000
            axios.putAsyncAxios('/v2/transfers/' + self.transferid + '/ftpservers/' + server.ftpserverid, null, param, (response) => {
            })
          }
          transfer.status = 4000
          transfer.transferendtime = custom.get_now_yyyymmddhhiiss()
          axios.putAsyncAxios('/v2/transfers/' + self.transferid, JSON.stringify(transfer), null, (response) => {
            self.isUploadComplete = true
            self.isUploading = false
            // console.log('CancelError AXIOS', response)
          })
        }
      } else if (self.isRoundRobin) {
        if (errMsg.message !== undefined) {
          let errFtpServerid = errMsg.ftpData.ftpserverid
          const param = {}
          param.status = 4000
          axios.putAsyncAxios('/v2/transfers/' + self.transferid + '/ftpservers/' + errFtpServerid, null, param, (response) => {
          })
        }
      }
    }
  }
}
</script>
