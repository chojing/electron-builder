<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb20">수신내역
        <button class="refresh-btn" @click="refresh"><i class="fas fa-sync-alt"></i></button>
      </h4>
      <div class="btn-box">
        <button id="mainnode" class="btn h30 active" :data-nodeid="this.nodeHome1" v-bind:class="{active:false}" @click="selectNodeHome($event, this.nodeHome1)">home1</button>
        <button id="subnode" class="btn h30" :data-nodeid="this.nodeHome2" @click="selectNodeHome($event, this.nodeHome2)">home2</button>
        <button id="usernode" class="btn h30" @click="selectNodeHome($event)">사용자지정</button>
      </div>
      <div class="send-box" style="height: 484px">
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
      <div class="paging mt10 mb20">
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
const { axios, custom, ipcRenderer } = require('@/assets/js/include.js')
export default {
  components: {
    templateReceivedHistory,
    templateMenu,
    pagination
  },
  data () {
    return {
      setTimerInterval: 0,
      g_windowIndex: 0,
      selfKey: 'main',
      nodeHome1: null,
      nodeHome2: null,
      selectedNodeid: null,
      receivedList: [],
      page: 1,
      total: null,
      limit: 9,
      isShow: false,
      isActive: false
    }
  },
  created () {
    this.getNodeHome()
    ipcRenderer.on('receiveData', this.init)
  },
  mounted () {
    this.setTimer()
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.getNodeHome()
      } else if (type == 'selectUserAppointed') {
        const mainnodeBtn = document.getElementById('mainnode')
        const subnodeBtn = document.getElementById('subnode')
        const usernodeBtn = document.getElementById('usernode')
        usernodeBtn.classList.add('active')
        mainnodeBtn.classList.remove('active')
        subnodeBtn.classList.remove('active')
        this.selectedNodeid = data.nodeid
        this.getReceivedList(1)
      } else if (type == 'closeUserAppointed') {
      }
    },
    getNodeHome: function () {
      let self = this
      axios.getAsyncAxios('/v2/users/' + this.$store.state.username, null, (response) => {
        self.nodeHome1 = response.data.result.metaset.result.mainnodeid
        self.nodeHome2 = response.data.result.metaset.result.subnodeid
        self.selectedNodeid = self.nodeHome1
        self.getReceivedList(1)
      }, (err) => {
        clearInterval(this.setTimerInterval)
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
        if (this.receivedList.length !== 0) {
          for (var idx in this.receivedList) {
            let item = this.receivedList[idx]
            item.filesize = custom.getFormatBytes(item.filesize)
            if (item.status >= 2000 && item.status < 3000) {
              item.dataPer = (parseInt(item.status) - 2000)
            } else {
              item.dataPer = 100
            }
          }
          this.isShow = false
        } else if (this.receivedList.length === 0) {
          this.isShow = true
        }
        // console.log('this.receivedList', this.receivedList)
        if (this.selectedNodeid !== null) { // getnodehome 함수에서 오류가 생겨 timer가 없어졌을 경우, 사용자지정조회에서는 timer 지정을 해야할 때
          clearInterval(this.setTimerInterval)
          this.setTimer()
        }
      }, (err) => {
        clearInterval(this.setTimerInterval)
      })
    },
    selectNodeHome: function (e, nodeid) {
      const mainnodeBtn = document.getElementById('mainnode')
      const subnodeBtn = document.getElementById('subnode')
      const usernodeBtn = document.getElementById('usernode')
      let isUsernode = true
      if (e.target.id === mainnodeBtn.id) {
        this.selectedNodeid = nodeid
        mainnodeBtn.classList.add('active')
        subnodeBtn.classList.remove('active')
        usernodeBtn.classList.remove('active')
      } else if (e.target.id === subnodeBtn.id) {
        this.selectedNodeid = nodeid
        subnodeBtn.classList.add('active')
        mainnodeBtn.classList.remove('active')
        usernodeBtn.classList.remove('active')
      } else if (e.target.id === usernodeBtn.id) {
        this.userAppointedPopup()
        isUsernode = false
        // usernodeBtn.classList.add('active')
        // mainnodeBtn.classList.remove('active')
        // subnodeBtn.classList.remove('active')
        // isUsernode = true
      }
      if (isUsernode) {
        this.getReceivedList(1)
      }
    },
    userAppointedPopup: function () {
      const data = {
        parentKey: this.selfKey
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'UserAppointed',
        data: data,
        width: 600,
        height: 700,
        parent: '',
        modal: true
      })
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
    },
    refresh: function () {
      this.getReceivedList()
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
