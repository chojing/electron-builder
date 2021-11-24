<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb40">전송내역</h4>
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
            <templateHistory/>
          </tbody>
        </table>
      </div>
      <div class="paging mt10">
<!--        <pagination class ="pagination"-->
<!--                    :pageSetting="custom.page.pagination(total, limit, offset, this.page)"-->
<!--                    @paging="getTransferList"/>-->
      </div>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateHistory from '@/components/history/Template_history_list'
import templateMenu from '@/components/menu/Template_menu'
// const axios = require('@/assets/js/axios.js')
// const custom = require('@/assets/js/custom.js')
export default {
  components: {
    templateHistory,
    templateMenu
  },
  data () {
    return {
      transferList: [],
      page: 1,
      limit: 10,
      offset: 5
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

      param.condition = condition
      const sort = {}
      sort.transferid = 'desc'
      param.sort = sort
      param.limit = this.limit
      param.offset = this.offset
      // axios.getAsyncAxios('/v2/transfers/', param, (response) => {
      //   this.transferList = response.data.results
      //   this.total = response.paging.total
      //   this.offset = response.paging.offset
      //   this.limit = response.paging.limit
      //   console.log('transferList : ', this.transferList)
      //
      //   if (page == null) {
      //
      //   } else {
      //     this.page = page
      //   }
      //   custom.page.pagination(this.total, this.limit, this.offset, page)
      // })
    }
  }
}
</script>
