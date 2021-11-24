<template>
  <section class="history-detaile-container">
    <div class="wrap">
      <h4 class="tti">전송내역 상세</h4>
      <p class="targetName mt20">
        전송명  :  {{ transfername }}
      </p>
      <div class="send-box">
        <table>
          <thead>
          <tr>
            <th>파일명</th>
            <th>파일크기</th>
          </tr>
          </thead>
          <tbody>
            <templateDetailHistory :transferDetailList="transferDetailList"/>
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
      page: 1,
      total: null,
      limit: 10,
      offset: 0
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
      this.getTransferDetailList(1)
    },
    getTransferDetailList: function (page) {
      this.transferDetailList = []
      const param = {}
      const condition = {}
      condition.transferid = parseInt(this.transferid)
      param.condition = condition
      const sort = {}
      sort.fileid = 'asc'
      param.sort = sort
      param.limit = this.limit
      param.offset = (page - 1) * this.limit
      axios.getAsyncAxios('/v2/transferfiles', param, (response) => {
        this.transferDetailList = response.data.results
        this.total = response.data.paging.total
        this.offset = response.data.paging.offset
        this.limit = response.data.paging.limit
        console.log('transferDetailList : ', this.transferDetailList)

        for (var idx in this.transferDetailList) {
          let item = this.transferDetailList[idx]
          item.filesize = custom.getFormatBytes(item.filesize)
        }
        if (page == null) {

        } else {
          this.page = page
        }
        // custom.pageSetting(this.total, this.limit, this.offset, page)
      }, (err) => {
        alert('오류가 발생했습니다! \n' + err)
      })
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    }
  }
}
</script>
