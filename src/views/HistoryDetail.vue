<template>
  <section class="history-detail-container">
    <div class="wrap">
      <h4 class="tti">전송내역 상세</h4>
      <p class="targetName mt10">
        전송명  :  {{ transfername }}
      </p>
      <div class="send-box wid600 h480">
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
            <templateDetailHistory :transferDetailList="transferDetailList" :isShow="isShow"/>
          </tbody>
        </table>
      </div>
      <button @click="cancel" type="button" id="cancel" class="btn h30 m-auto">확인</button>
    </div>
  </section>

</template>

<script>
import templateDetailHistory from '@/components/history/Template_history_detail_list'
const { ipcRenderer, axios, custom } = require('@/assets/js/include.js')
export default {
  components: {
    templateDetailHistory
  },
  data () {
    return {
      g_windowIndex: 0,
      parentKey: '',
      g_curWindowKey: '',
      c_ftp_transfer_type: [],
      transfername: '',
      transferid: '',
      transfertype_code: '',
      transferDetailList: [],
      transferDetailNameList: [],
      isShow: false
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    init: function (event, key, data) {
      this.transfername = data.transfername
      this.transferid = data.transferid
      this.transfertype_code = data.transfertype_code
      this.parentKey = data.parentKey
      this.g_curWindowKey = key
      // console.log('data :', data)
      this.getTransferDetailList()
    },
    getTransferDetailList: function () {
      this.transferDetailList = []
      const param = {}
      param.transferid = this.transferid
      const sort = {}
      // sort.transferid = 'desc'
      sort.status = 'asc'
      sort.ftpserverid = 'asc'
      sort.filename = 'asc'
      param.sort = sort
      axios.getAsyncAxios('/v2/transferfiles', param, (response) => {
        this.transferDetailList = response.data.results
        // console.log('transferDetailList : ', this.transferDetailList)
        let count = 0
        if (this.transferDetailList.length !== 0) {
          for (var idx in this.transferDetailList) {
            let item = this.transferDetailList[idx]
            item.filesize = custom.getFormatBytes(item.filesize)
            if (this.transfertype_code === 'roundrobin') {
              if (item.status === 3000) {
                count++
                // console.log('===', item)
              }
            }
          }
          // 라운드 로빈일 경우, 성공한 건이 있으면 성공한 서버만 출력 / 성공한 건이 없으면 실패한 내역 전체 출력
          if (this.transfertype_code === 'roundrobin' && count !== 0 && count > 0) { // 성공 했을 경우
            for (let i = 0; i < this.transferDetailList.length; i++) {
              // eslint-disable-next-line no-prototype-builtins
              // let hasStatus = item.hasOwnProperty('status')
              let hasStatus = Object.keys(this.transferDetailList[i]).includes('status')
              if (!hasStatus || this.transferDetailList[i].status === 4000) {
                this.transferDetailList.splice([i])
              }
            }
          }
          this.isShow = false
        } else if (this.transferDetailList.length === 0) {
          this.isShow = true
        }
      })
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    }
  }
}
</script>
