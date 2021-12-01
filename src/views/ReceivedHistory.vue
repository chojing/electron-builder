<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb40">수신내역</h4>
      <div class="btn-box">
        <button id="mainnode" class="btn h30" :data-nodeid="this.nodeHome1" @click="selectNodeHome(this.nodeHome1)">home1</button>
        <button id="subnode" class="btn h30" :data-nodeid="this.nodeHome2" @click="selectNodeHome(this.nodeHome2)">home2</button>
      </div>
      <div class="send-box">
        <table>
          <colgroup>
            <col width="25%">
            <col width="30%">
            <col width="20%">
            <col width="20%">
          </colgroup>
          <thead>
          <tr>
            <th>전송명</th>
            <th>수신처</th>
            <th>전송자</th>
            <th>전송상태</th>
          </tr>
          </thead>
          <tbody>
            <templateReceivedHistory :receivedList="receivedList" :isShow="isShow"/>
          </tbody>
        </table>
      </div>
      <div class="paging mt20 mb20">
        <pagination class ="pagination" ref="pagination"
                  :pageData="pageSet(total, limit, this.page)"
                  @paging="getReceivedList"/>
      </div>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateReceivedHistory from '@/components/receivedHistory/Template_receivedHistory_list'
import templateMenu from '@/components/menu/Template_menu'
import pagination from '@/components/includes/Template_pagination'
const { axios, custom } = require('@/assets/js/include.js')
export default {
  components: {
    templateReceivedHistory,
    templateMenu,
    pagination
  },
  data () {
    return {
      setTimerInterval: 0,
      nodeHome1: null,
      nodeHome2: null,
      selectedNodeid: null,
      receivedList: [],
      page: 1,
      total: null,
      limit: 8,
      isShow: false
    }
  },
  created () {
    this.getNodeHome()
  },
  mounted () {
    this.setTimer()
  },
  methods: {
    getNodeHome: function () {
      let self = this
      axios.getAsyncAxios('/v2/users/' + this.$store.state.username, null, (response) => {
        for (let idx in response.data.result.metaset.metafield) {
          let item = response.data.result.metaset.metafield[idx]
          if (item.fieldname === 'mainnodeid') {
            self.nodeHome1 = item.fieldvalue
          } else if (item.fieldname === 'subnodeid') {
            self.nodeHome2 = item.fieldvalue
          }
        }
        self.selectedNodeid = self.nodeHome1
        self.getReceivedList(1)
      })
    },
    getReceivedList: function (page) {
      if (page == null) {
        this.page = 1
      } else {
        this.page = page
      }
      const param = {}
      const condition = {}
      condition.pathnodeid_keyword = this.selectedNodeid
      param.condition = condition
      const sort = {}
      sort.transferid = 'desc'
      param.sort = sort
      param.limit = this.limit
      param.offset = (this.page - 1) * this.limit

      axios.getAsyncAxios('/v2/transfers', param, (response) => {
        this.receivedList = response.data.results
        this.total = response.data.paging.total
        this.limit = response.data.paging.limit
        for (var idx in this.receivedList) {
          let item = this.receivedList[idx]
          item.filesize = custom.getFormatBytes(item.filesize)
          if (item.status >= 2000 && item.status < 3000) {
            item.dataPer = (parseInt(item.status) - 2000)
          } else {
            item.dataPer = 100
          }
        }
        if (this.receivedList.length === 0) {
          this.isShow = true
        } else {
          this.isShow = false
        }
        console.log('this.receivedList', this.receivedList)
      })
    },
    selectNodeHome: function (nodeid) {
      this.selectedNodeid = nodeid
      this.getReceivedList(1)
    },
    setTimer: function () {
      var _this = this
      let timer = 1 * 1000
      this.setTimerInterval = setInterval(function () {
        _this.getReceivedList(_this.page)
      }, timer)
    },
    pageSet: function (total, limit, page) {
      return custom.pageSetting(total, limit, page)
    }
  },
  watch: {
    $route () {
      clearInterval(this.setTimerInterval)
    }
  }
}
</script>
