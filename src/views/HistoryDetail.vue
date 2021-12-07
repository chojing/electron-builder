<template>
  <section class="history-detail-container">
    <div class="wrap">
      <h4 class="tti">전송내역 상세</h4>
      <p class="targetName mt20">
        전송명  :  {{ transfername }}
      </p>
      <div class="send-box wid600 h480">
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
            <templateDetailHistory :transferDetailList="transferDetailList" :isShow="isShow"/>
          </tbody>
        </table>
      </div>
      <button @click="cancel" type="button" id="cancel" class="btn h40 m-auto">확인</button>
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
      transfername: '',
      transferid: '',
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
      this.parentKey = data.parentKey
      this.g_curWindowKey = key
      this.getTransferDetailList()
    },
    getTransferDetailList: function () {
      this.transferDetailList = []
      const param = {}
      param.transferid = this.transferid
      axios.getAsyncAxios('/v2/transferfiles', param, (response) => {
        this.transferDetailList = response.data.results
        // console.log('transferDetailList : ', this.transferDetailList)
        if (this.transferDetailList.length !== 0) {
          for (var idx in this.transferDetailList) {
            let item = this.transferDetailList[idx]
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
