<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb15">전송 진행사항</h4>
      <div class="send-box" style="height: 527px;">
        <table>
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
      <button v-on:click = "doCancel" class="btn h30" v-show="isUploading&&!isUploadComplete">전송취소</button>
      <button v-on:click = "doClose" class="btn h30" v-show="!isUploading&&isUploadComplete">전송완료</button>
    </div>
  </section>
</template>r554

<script>
import templateProgress from '@/components/main/Template_ftpSiteTransferProgress_list'
const { axios, ipcRenderer, custom } = require('@/assets/js/include.js')
let serverResultList = {}
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
      isUploading: true,
      isUploadComplete: false,
      isResponse: false,
      tempCurrentPercent: -1
    }
  },
  created () {
    let self = this
    ipcRenderer.on('receiveData', self.init)
    ipcRenderer.on('ftp-result', self.ftpResult)
  },
  methods: {
    init: function (event, key, data, type) {
      this.parentKey = data.g_ftpSendData.clientData.parentKey
      this.g_curWindowKey = key
      this.g_ftpSendData = data.g_ftpSendData
      for (let idx in data.g_ftpSendData.ftpSite.ftpServerList) {
        let server = data.g_ftpSendData.ftpSite.ftpServerList[idx]
        serverResultList[server.name] = { totalPercent: 0 }
        for (let idy in data.g_ftpSendData.fileList) {
          let item = data.g_ftpSendData.fileList[idy]
          let obj = {}
          obj.ftpserverid = server.ftpserverid
          obj.ftpservername = server.name
          obj.fileName = item.fileName
          obj.dataPer = 0
          this.ftpResultData.push(obj)
        }
      }
      this.transferid = data.g_ftpSendData.clientData.transferid
      this.nodeid = data.g_ftpSendData.clientData.nodeid
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
      const transfer = {}
      transfer.isfolder = false
      transfer.userid = self.$store.state.username
      transfer.filepath = ''
      transfer.status = 2000
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
          }

          // console.log('transfer.status : ', transfer.status, ' sitePercent : ', sitePercent)
          if ((!self.isResponse && self.transferid != null) || Math.floor(sitePercent) == 100) {
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
    },
    doCancel: function () {
      console.log('cancel Test!')
      let self = this
      let isFileDelete = true
      let cancelType = 'all' // all / path

      let cancelInfo = {
        cancelType: cancelType,
        cancelConnectionList: self.g_ftpSendData.ftpSite.ftpServerList,
        isDelete: isFileDelete,
        path: undefined // type 이 path일 경우만 기재
      }
      ipcRenderer.send('ftp-cancel', custom.proxy2map(cancelInfo))

      console.log('cancel request!')
      ipcRenderer.send('sendData', self.parentKey, null, 'isFtpSiteCancel')
      ipcRenderer.send('closeWindow', self.g_curWindowKey)
    },
    doClose: function () {
      let self = this
      if (self.isUploading == false && self.isUploadComplete == true) {
        ipcRenderer.send('closeWindow', self.g_curWindowKey)
        ipcRenderer.send('closeWindow', self.parentKey)
      }
    }
  }
}
</script>
