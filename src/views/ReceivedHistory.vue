<template>
  <section class="history-container">
    <div class="wrap pb60" @click="hideContextMenu()" @contextmenu.prevent.self="hideContextMenu">
      <h4 class="tti mb10">수신내역
        <button class="refresh-btn" @click="refresh"><i class="fas fa-sync-alt"></i></button>
      </h4>
      <div class="btn-box">
        <button id="mainnode" class="btn h30 active" :data-nodeid="this.nodeHome1" v-bind:class="{active:false}" @click="selectNodeHome($event, this.nodeHome1)">home1(미지정)</button>
        <button id="subnode" class="btn h30" :data-nodeid="this.nodeHome2" @click="selectNodeHome($event, this.nodeHome2)">home2(미지정)</button>
        <button id="usernode" class="btn h30" @click="selectNodeHome($event)">사용자지정</button>
      </div>
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
            <th>전송자</th>
            <th>전송명</th>
            <th>받은 곳</th>
            <th>전송상태</th>
          </tr>
          </thead>
          <tbody>
            <templateReceivedHistory :receivedList="receivedList" :isShow="isShow"/>
          </tbody>
        </table>
      </div>
      <div class="paging">
        <pagination class ="pagination" ref="pagination"
                  :pageData="pageSet(total, limit, this.page)"
                  @paging="getReceivedList"/>
      </div>
    </div>
  </section>
  <templateMenu/>
  <templateContextMenu :receivedList="receivedList" :transferid="transferid" :gIsMac="gIsMac"/>
</template>

<script>
import templateReceivedHistory from '@/components/receivedHistory/Template_receivedHistory_list'
import templateMenu from '@/components/menu/Template_menu'
import templateContextMenu from '@/components/receivedHistory/Template_context_menu'
import pagination from '@/components/includes/Template_pagination'
const { axios, custom, ipcRenderer } = require('@/assets/js/include.js')
export default {
  components: {
    templateReceivedHistory,
    templateMenu,
    templateContextMenu,
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
      transferid: null,
      gIsMac: false,
      page: 1,
      total: null,
      limit: 15,
      isShow: false,
      isActive: false
    }
  },
  created () {
    this.getNodeHome()
    this.gIsMacCheck()
    ipcRenderer.on('receiveData', this.init)
  },
  mounted () {
    this.setTimer()
    console.log('페이지이동 후 값 확인:', this.$store.state.nodeid)
  },
  methods: {
    gIsMacCheck: function () {
      var agent = window.navigator.userAgent.toLowerCase()
      if (agent.indexOf('mac') != -1 || agent.indexOf('macintosh') != -1) {
        this.gIsMac = true
      }
    },
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
        usernodeBtn.innerText = '사용자지정'
        usernodeBtn.innerText += ' : ' + data.nodename
        this.selectedNodeid = data.nodeid
        // this.getReceivedList(1)
        this.$store.state.nodeid = data.nodeid
        this.$store.state.nodename = data.nodename
        console.log('$store nodeid:', this.$store.state.nodeid)
        console.log('$store nodename:', this.$store.state.nodename)
      } else if (type == 'closeUserAppointed') {
      }
    },
    getNodeHome: function () {
      let self = this
      axios.getAsyncAxios('/v2/users/' + this.$store.state.username, null, (response) => {
        self.nodeHome1 = response.data.result.metaset.result.mainnodeid
        self.nodeHome2 = response.data.result.metaset.result.subnodeid

        axios.getAsyncAxios('/v2/nodes/' + self.nodeHome1, null, (response) => {
          // console.log('mainnode : ', response.data.result)
          if (response.data.result !== null) {
            let home1Name = response.data.result.pathname
            // let home1Name = response.data.result.pathname + '>' + response.data.result.name
            if (home1Name !== null) {
              document.getElementById('mainnode').innerText = home1Name
            }
          }
        })
        axios.getAsyncAxios('/v2/nodes/' + self.nodeHome2, null, (response) => {
          // console.log('subnode : ', response.data.result)
          if (response.data.result !== null) {
            let home2Name = response.data.result.pathname
            // let home2Name = response.data.result.pathname + '>' + response.data.result.name
            if (home2Name !== null) {
              document.getElementById('subnode').innerText = home2Name
            }
          }
        })
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
        if (this.$store.state.nodename === null) {
          usernodeBtn.innerText = '사용자지정 '
        } else {
          usernodeBtn.innerText = '사용자지정 : ' + this.$store.state.nodename
        }
      } else if (e.target.id === subnodeBtn.id) {
        this.selectedNodeid = nodeid
        subnodeBtn.classList.add('active')
        mainnodeBtn.classList.remove('active')
        usernodeBtn.classList.remove('active')
        if (this.$store.state.nodename === null) {
          usernodeBtn.innerText = '사용자지정 '
        } else {
          usernodeBtn.innerText = '사용자지정 : ' + this.$store.state.nodename
        }
      } else if (e.target.id === usernodeBtn.id) {
        if (this.$store.state.nodeid === null) {
          this.userAppointedPopup()
        }
        console.log('state 사용자지정:', this.$store.state.nodeid)
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
    showContextMenu: function (e) {
      this.transferid = e.currentTarget.dataset.transferid
      var menu = document.getElementById('favorits-menu')
      menu.style.left = e.pageX + 'px'
      menu.style.top = e.pageY + 'px'
      if (e.currentTarget.dataset.transferid) {
        menu.classList.add('active')
      }
    },
    hideContextMenu: function () {
      document.getElementById('favorits-menu').classList.remove('active')
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
