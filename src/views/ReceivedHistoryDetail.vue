<template>
  <section class="history-detaile-container">
    <div class="wrap">
      <h4 class="tti">수신내역 상세</h4>
      <p class="targetName mt20">
        전송명  :  {{ transfername }}
      </p>
      <div class="send-box h480">
        <table>
          <colgroup>
            <col width="18%">
            <col width="18%">
            <col width="auto">
            <col width="140px">
          </colgroup>
          <thead>
          <tr>
            <th>서버명</th>
            <th>파일경로</th>
            <th>파일명</th>
            <th>파일크기</th>
          </tr>
          </thead>
          <tbody>
            <templateReceivedDetailHistory @selectftpserverinfo="selectResult" :receivedDetailList="receivedDetailList" :isShow="isShow"/>
          </tbody>
        </table>
      </div>
      <button @click="cancel" type="button" id="cancel" class="btn h40 m-auto">확인</button>
    </div>
  </section>
</template>

<script>
import templateReceivedDetailHistory from '@/components/receivedHistory/Template_receivedHistory_detail_list'
const { ipcRenderer, axios, custom } = require('@/assets/js/include.js')
export default {
  components: {
    templateReceivedDetailHistory
  },
  data () {
    return {
      g_windowIndex: 0,
      parentKey: '',
      g_curWindowKey: '',
      transfername: '',
      transferid: '',
      selectFtpserverInfo: '',
      gIsMac: false,
      receivedDetailList: [],
      receivedDetailNameList: [],
      isShow: false
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
    ipcRenderer.on('open-file-explore-error', this.ftpError)
  },
  methods: {
    init: function (event, key, data) {
      this.transfername = data.transfername
      this.transferid = data.transferid
      this.parentKey = data.parentKey
      this.g_curWindowKey = key
      var agent = window.navigator.userAgent.toLowerCase()
      // console.log('agent : ', agent)
      if (agent.indexOf('mac') != -1 || agent.indexOf('macintosh') != -1) {
        this.gIsMac = true
      }
      this.getReceivedDetail()
    },
    getReceivedDetail: function () {
      this.receivedDetailList = []
      const param = {}
      param.transferid = this.transferid
      axios.getAsyncAxios('/v2/transferfiles', param, (response) => {
        this.receivedDetailList = response.data.results

        for (var idx in this.receivedDetailList) {
          let item = this.receivedDetailList[idx]
          item.filesize = custom.getFormatBytes(item.filesize)
          if (item.filename.indexOf('/') !== -1) {
            let nameStr = item.filename.split('/')
            for (let i = 1; i < nameStr.length; i++) {
              if (i != nameStr.length - 1) {
                item.filepath += ('/' + nameStr[i])
              } else if (i == (nameStr.length - 1)) {
                item.filepath += '/'
              }
            }
            item.filename = nameStr[nameStr.length - 1]
          }
          axios.getAsyncAxios('/v2/ftpservers/' + item.ftpserverid, null, (response) => {
            let self = this
            if (self.gIsMac) {
              item.gIsMac = true
              item.volume = response.data.result.macvolume
            } else {
              item.gIsMac = false
              item.volume = response.data.result.winvolume
            }
          })
        }
        if (this.receivedDetailList.length === 0) {
          this.isShow = true
        } else {
          this.isShow = false
        }
      })
    },
    selectResult: function (val) {
      this.selectFtpserverInfo = val
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    ftpError: function (event, err) {
      let severname = this.selectFtpserverInfo.ftpservername
      let filepath = this.selectFtpserverInfo.filepath
      console.log('err', err)
      let msg = severname + '에 ' + filepath + ' 파일 경로가 없습니다.'
      ipcRenderer.send('alert', msg)
    }
  }
}
</script>
