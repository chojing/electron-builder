<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb20">전송내역</h4>
      <div class="send-box">
        <table>
          <thead>
          <tr>
            <th>전송명</th>
            <th>수신처</th>
            <th>파일크기</th>
            <th>전송상태</th>
          </tr>
          </thead>
          <tbody>
            <templateHistory :transferList="transferList"/>
          </tbody>
        </table>
      </div>
      <div class="paging mt10">
<!--        <pagination class ="pagination" ref="pagination"-->
<!--                    :pageData="pageSet(total, limit, offset, this.page)"-->
<!--                    @paging="getTransferList"/>-->
      </div>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateHistory from '@/components/history/Template_history_list'
import templateMenu from '@/components/menu/Template_menu'
// import pagination from '@/components/includes/Template_pagination'
const { axios, custom } = require('@/assets/js/include.js')
export default {
  components: {
    templateHistory,
    templateMenu
    // pagination
  },
  data () {
    return {
      transferList: [],
      page: 1,
      total: null,
      limit: 9,
      offset: 0
    }
  },
  created () {
    this.getTransferList(1)
  },
  methods: {
    getTransferList: function (page) {
      this.transferList = []
      const param = {}
      const condition = {}
      condition.userid = parseInt(this.$store.state.userid)
      param.condition = condition
      const sort = {}
      sort.transferid = 'desc'
      param.sort = sort
      param.limit = this.limit
      param.offset = (page - 1) * this.limit
      axios.getAsyncAxios('/v2/transfers', param, (response) => {
        this.transferList = response.data.results
        this.total = response.data.paging.total
        this.offset = response.data.paging.offset
        this.limit = response.data.paging.limit
        console.log('transferList : ', this.transferList)
        for (var idx in this.transferList) {
          let item = this.transferList[idx]
          item.filesize = custom.getFormatBytes(item.filesize)
          if (item.status >= 2000 && item.status < 3000) {
            item.dataPer = (parseInt(item.status) - 2000)
          }
        }

        if (page == null) {

        } else {
          this.page = page
        }
        // pageSetting(this.total, this.limit, this.offset, page)
      })
    },
    pageSet: function (total, limit, offset, page) {
      // pageSetting(total, limit, offset, page)
    }
  }
}
</script>
