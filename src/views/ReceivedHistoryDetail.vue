<template>
  <section class="history-detail-container">
    <div class="wrap">
      <h4 class="tti">수신내역 상세</h4>
      <p class="targetName mt10">
        전송명  :  {{ transfername }}
      </p>
      <div class="send-box h480">
        <table>
          <colgroup>
            <col width="18%">
            <col width="20%">
            <col width="auto">
            <col width="100px">
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
      <button @click="cancel" type="button" id="cancel" class="btn h30 m-auto">확인</button>
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
      transfertype_code: '',
      selectFtpserverInfo: '',
      gIsMac: false,
      volume: '',
      receivedDetailList: [],
      receivedDetailNameList: [],
      isShow: false
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
    // ipcRenderer.on('open-file-explore-error', this.ftpError)
  },
  methods: {
    init: function (event, key, data) {
      this.transfername = data.transfername
      this.transferid = data.transferid
      this.transfertype_code = data.transfertype_code
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
      const sort = {}
      // sort.transferid = 'desc'
      sort.status = 'asc'
      sort.ftpserverid = 'asc'
      sort.filename = 'asc'
      param.sort = sort
      axios.getAsyncAxios('/v2/transferfiles', param, (response) => {
        this.receivedDetailList = response.data.results

        let count = 0
        if (this.receivedDetailList.length !== 0) {
          for (var idx in this.receivedDetailList) {
            let item = this.receivedDetailList[idx]
            item.filesize = custom.getFormatBytes(item.filesize)
            axios.getAsyncAxios('/v2/ftpservers/' + item.ftpserverid, null, (response) => {
              let self = this
              if (self.gIsMac) {
                item.gIsMac = true
                item.volume = response.data.result.macvolume
                this.volume = response.data.result.macvolume
              } else {
                item.gIsMac = false
                item.volume = response.data.result.winvolume
                this.volume = response.data.result.winvolume
              }
            })
            if (this.transfertype_code === 'roundrobin') {
              if (item.status === 3000) {
                count++
                // console.log('===', item)
              }
            }
          }
          // 라운드 로빈일 경우, 성공한 건이 있으면 성공한 서버만 출력 / 성공한 건이 없으면 실패한 내역 전체 출력
          if (this.transfertype_code === 'roundrobin' && count !== 0 && count > 0) { // 성공 했을 경우
            for (let i = 0; i < this.receivedDetailList.length; i++) {
              // eslint-disable-next-line no-prototype-builtins
              // let hasStatus = item.hasOwnProperty('status')
              let hasStatus = Object.keys(this.receivedDetailList[i]).includes('status')
              if (!hasStatus || this.receivedDetailList[i].status === 4000) {
                this.receivedDetailList.splice([i])
              }
            }
          }
          this.isShow = false
        } else if (this.receivedDetailList.length === 0) {
          this.isShow = true
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
      let volume = this.volume
      let severname = this.selectFtpserverInfo.ftpservername
      let filepath = this.selectFtpserverInfo.filepath
      console.log('err', err)
      let fullpath = volume + filepath
      if (this.gIsMac) {
        fullpath = fullpath.replaceAll('/', '\\')
      } else {
        fullpath = fullpath.replaceAll('/', '\\')
        fullpath = fullpath.replaceAll('\\\\', '\\')
      }
      let msg = severname + '에 ' + fullpath + ' 파일 경로가 없습니다.'
      ipcRenderer.send('alert', msg)
    }
  }
}
</script>
