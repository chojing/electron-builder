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
      <button v-on:click = "doCancel" class="btn h30" v-show="isUploading&&!isUploadComplete">전송 취소</button>
      <button v-on:click = "doClose" class="btn h30" v-show="!isUploading&&isUploadComplete">전송완료</button>
    </div>
  </section>
</template>r554

<script>
import templateProgress from '@/components/main/Template_ftpSiteTransferProgress_list'
const { axios, ipcRenderer } = require('@/assets/js/include.js')
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
        let obj = {}
        obj.ftpserverid = server.ftpserverid
        for (let idy in data.g_ftpSendData.fileList) {
          let item = data.g_ftpSendData.fileList[idy]
          obj.fileName = item.fileName
        }
        this.ftpResultData.push(obj)
      }
      this.transferid = data.g_ftpSendData.clientData.transferid
      this.nodeid = data.g_ftpSendData.clientData.nodeid
      console.log('data', data)

      // start FTP
      ipcRenderer.send('ftp-file-upload-start')
    },
    ftpResult: function (event, data) {
      // console.log('ftpResult', data)
      for (let idx in this.ftpResultData) {
        let item = this.ftpResultData[idx]
        if (item.fileName == data.ftpData.fileName && item.ftpserverid == data.ftpServer.ftpserverid) {
          item.dataPer = data.ftpData.curWorkPersent
          item.isComplete = data.ftpData.isComplete
        }
      }
      // transfer_tb insert data
      const transfer = {}
      transfer.isfolder = false
      transfer.userid = this.$store.state.userid
      transfer.filepath = ''
      transfer.status = 2000
      transfer.transfername = this.g_ftpSendData.title
      transfer.trasnferrequest = this.g_ftpSendData.comment
      transfer.filesize = 0
      for (let idx in this.g_ftpSendData.fileList) {
        let item = this.g_ftpSendData.fileList[idx]
        transfer.filesize += item.size
      }
      if (this.nodeid) {
        transfer.nodeid = this.nodeid
      }

      if (!data.ftpData.isTotalComplete) {
        if (this.tempCurrentPercent !== parseInt(data.ftpData.totalWorkSize_Percent)) {
          this.tempCurrentPercent = parseInt(data.ftpData.totalWorkSize_Percent)
          transfer.status += parseInt(data.ftpData.totalWorkSize_Percent)
          if (data.ftpData.totalWorkSize_Percent == 100) {
            transfer.status = 3000
          }

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
      }
    },
    doCancel: function () {
      console.log('cancel Test!')

      let isFileDelete = true
      let cancelType = 'all' // all / path

      let cancelInfo = {
        cancelType: cancelType,
        cancelConnectionList: this.g_ftpSendData.ftpSite.ftpServerList,
        isDelete: isFileDelete,
        path: undefined // type 이 path일 경우만 기재
      }
      ipcRenderer.send('ftp-cancel', cancelInfo)

      console.log('cancel request!')
      ipcRenderer.send('sendData', this.parentKey, null, 'isFtpSiteCancel')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    doClose: function () {
      if (this.isUploading == false && this.isUploadComplete == true) {
        ipcRenderer.send('closeWindow', this.g_curWindowKey)
        ipcRenderer.send('closeWindow', this.parentKey)
      }
    }
  }
}
</script>
