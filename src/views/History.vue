<template>
  <section class="history-container">
    <div class="wrap pb60">
      <h4 class="tti">전송내역
        <button class="refresh-btn" @click="refresh"><i class="fas fa-sync-alt"></i></button>
      </h4>
      <div class="send-box">
        <table>
          <colgroup>
            <col width="18%">
            <col width="auto">
            <col width="18%">
            <col width="100px">
          </colgroup>
          <thead>
          <tr>
            <th>전송명</th>
            <th>전송한 곳</th>
            <th>전송완료시간</th>
            <th>전송상태</th>
          </tr>
          </thead>
          <tbody>
            <templateHistory :transferList="transferList" :isShow="isShow"/>
          </tbody>
        </table>
      </div>
      <div class="paging mt10 mb20">
        <pagination class ="pagination" ref="pagination"
                    :pageData="pageSet(total, limit, this.page)"
                    @paging="getTransferList"/>
      </div>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateHistory from '@/components/history/Template_history_list'
import templateMenu from '@/components/menu/Template_menu'
import pagination from '@/components/includes/Template_pagination'
const { axios, custom } = require('@/assets/js/include.js')
export default {
  components: {
    templateHistory,
    templateMenu,
    pagination
  },
  data () {
    return {
      setTimerInterval: 0,
      transferList: [],
      page: 1,
      total: null,
      limit: 16,
      isShow: false
    }
  },
  created () {
    this.getTransferList(1)
  },
  mounted () {
    this.setTimer()
  },
  methods: {
    getTransferList: function (page) {
      if (page == null) {
        this.page = 1
      } else {
        this.page = page
      }

      const param = {}
      const condition = {}
      condition.userid = this.$store.state.username
      param.condition = condition
      const sort = {}
      sort.transferid = 'desc'
      param.sort = sort
      param.limit = this.limit
      param.offset = (this.page - 1) * this.limit

      axios.getAsyncAxios('/v2/transfers', param, (response) => {
        this.transferList = response.data.results
        this.total = response.data.paging.total
        this.limit = response.data.paging.limit
        // console.log('transferList : ', this.transferList)
        if (this.transferList.length !== 0) {
          for (var idx in this.transferList) {
            let item = this.transferList[idx]
            item.filesize = custom.getFormatBytes(item.filesize)
            if (item.status >= 2000 && item.status < 3000) {
              item.dataPer = (parseInt(item.status) - 2000)
            } else {
              item.dataPer = 100
            }
            item.transferendtime = custom.convertDate(item.transferendtime)
          }
          this.isShow = false
        } else if (this.transferList.length === 0) {
          this.isShow = true
        }
      }, (err) => {
        clearInterval(this.setTimerInterval)
      })
    },
    setTimer: function () {
      var _this = this
      let timer = 1 * 1000
      this.setTimerInterval = setInterval(function () {
        _this.getTransferList(_this.page)
      }, timer)
    },
    pageSet: function (total, limit, page) {
      return custom.pageSetting(total, limit, page)
    },
    refresh: function () {
      this.getTransferList(1)
      // this.$router.go()
    }
  },
  watch: {
    $route () {
      clearInterval(this.setTimerInterval)
    }
  }
}
</script>
