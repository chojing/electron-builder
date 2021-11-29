<template>
  <main id="mainView">
    <div class="wrap">
      <h2>Anywhere 통합전송시스템</h2>
      <div class="head-top mt20">
        <div>
          <div class="user-name flex-box flex-center">
            <p><i class="fas fa-user"></i> {{username}}</p>
            <div class="btn-box">
              <button id="logoutBtn" class="btn h30" @click="logoutCheck">Logout</button>
            </div>
          </div>
        </div>
      </div>
      <div class="user-favorite">
        <h4>즐겨찾기</h4>
        <div class="favorite-list">
          <div class="fa-item-link fa-item flex-column">
            <button v-for="item in favoritsList" v-bind:key="item.nodeid" @dblclick="this.fileUploadPopup(item)" @click.prevent>
              <template v-if="Array.isArray(item.name)">
                <template v-for="item in item.name" v-bind:key="item">
                  <span>{{item}}</span>
                </template>
              </template>
              <template v-else>
                <span>{{item.name}}</span>
              </template>
            </button>
          </div>
        </div>
      </div>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
            <h4>전송 Target</h4>
            <div class="search-btn"><button @click="active = !active" :aria-pressed="active ? 'true' : 'false'"><i class="fas fa-search"></i></button></div>
          </div>
          <div class="search-box mt10 mb20" :class="{show:active}">
            <input id='targetSearchInput' @keyup.enter="this.targetSearch" type="text" placeholder="전송타겟을 입력해주세요">
          </div>
        </div>
        <div class="target-list mt40">
          <ul class="one-list" id="targetContainer" @click="hideContextMenu()" @contextmenu.prevent="showContextMenu($event)">
            <templateTree v-bind:nodeList="nodeList" ref="templateTree"/>
          </ul>
        </div>
      </article>
    </div>
    <div class="logoutCheckPop" v-show="isLogoutCheck">
      <p>로그아웃 하시겠습니까?</p>
      <div class="btn-box">
        <button class="btn h30" @click="logout">확인</button>
        <button class="btn h30 blue">취소</button>
      </div>
    </div>
    <div class="bg" v-show="isLogoutCheck"></div>
  </main>
  <templateMenu/>
  <templateContextMenu :nodeid="nodeid" :username="username" :nodename="nodename"
                       :path_ftpserverid="path_ftpserverid" :path_ftpsiteid="path_ftpsiteid"/>
</template>
<script>
import templateTree from '@/components/main/Template_tree'
import templateMenu from '@/components/menu/Template_menu'
import templateContextMenu from '@/components/main/Template_context_menu'
const { axios, custom, ipcRenderer } = require('@/assets/js/include.js')
let isOnline = true

export default {
  name: 'Main',
  el: '#mainView',
  components: {
    templateTree,
    templateMenu,
    templateContextMenu
  },
  created () {
    window.addEventListener('online', this.updateOnlineStatus)
    window.addEventListener('offline', this.updateOnlineStatus)
    ipcRenderer.on('offline_result', this.offlineResult)
  },
  data () {
    return {
      username: this.$store.state.username,
      c_node_type: [],
      favoritsList: [],
      nodeList: [],
      nodeid: null,
      path_ftpserverid: null,
      path_ftpsiteid: null,
      nodename: null,
      active: false,
      isLogoutCheck: false
    }
  },
  mounted () {
    this.getTree()
    this.getFavorits()
  },
  methods: {
    logoutCheck: function () {
      this.isLogoutCheck = true
    },
    logout: function () {
      axios.deleteAsyncAxios('/v2/users/apikey', null, null, (response) => {
        alert('로그아웃 되었습니다.')
        this.goTo('Login?logout')
      })
    },
    goTo: function (page) {
      this.$router.push(page)
    },
    updateOnlineStatus: function () {
      if (navigator.onLine == true) {
        console.log('online')
        isOnline = true
      } else {
        console.log('offline')
        ipcRenderer.send('offline')
      }
    },
    offlineResult: function (event) {
      if (isOnline == true) {
        alert('네트워크 연결이 끊어졌습니다')
        isOnline = false
      }
    },
    getTree: function () {
      axios.getAsyncAxios('/v2/node/code', {}, (response) => {
        this.c_node_type = response.data.c_node_type
        let param = {}
        param.nodetype = custom.code.codeToValue(this.c_node_type, 'normal')
        axios.getAsyncAxios('/v2/nodes/tree', param, (response) => {
          for (let node of response.data.results.children) {
            node.isopen = true
          }
          this.nodeList = response.data.results.children
        })
      })
    },
    // getTree: function () {
    //   axios.getSyncAxios('/v2/nodes', null, (response) => {
    //     axios.getSyncAxios('/nodes/' + response.data.result.nodename, null, (response) => {
    //       this.nodeList = response.data.results
    //     })
    //   }, function (error) {
    //     this.nodeList = []
    //     axios.setError(error.response.data)
    //   })
    // }
    getFavorits: function () {
      axios.getAsyncAxios('/v2/users/' + this.username + '/favorits', null, (response) => {
        this.favoritsList = response.data.results
        var favorits = this.favoritsList.map((obj) => obj['name'])
        // console.log('favorits : ', favorits)
        for (var idx in favorits) {
          let hasDepth = favorits[idx]
          if (hasDepth !== undefined) {
            if (hasDepth.indexOf('>') !== -1) {
              var str = hasDepth.split('>')
              // console.log('str : ', str)
              this.favoritsList[idx].name = str
            }
          }
        }
        // console.log('favoritsList : ', this.favoritsList)
      })
    },
    showContextMenu: function (e) {
      this.nodeid = ''
      document.getElementById('favorits-checkbox-id').checked = false
      if (e.target.dataset.nodeid == undefined) {
        this.hideContextMenu()
      }
      if (e.target.dataset.haschild == 0 && e.target.dataset.nodeid) {
        var menu = document.getElementById('favorits-menu')
        menu.style.left = e.pageX + 'px'
        menu.style.top = e.pageY + 'px'
        this.nodeid = e.target.dataset.nodeid
        this.path_ftpserverid = parseInt(e.target.dataset.path_ftpserverid)
        this.path_ftpsiteid = parseInt(e.target.dataset.path_ftpsiteid)
        this.nodename = e.target.dataset.name
        var userFavorits = this.favoritsList.map((obj) => obj['nodeid'])
        for (var idx in userFavorits) {
          let favoritsNodeid = userFavorits[idx]
          if (this.nodeid == favoritsNodeid) {
            document.getElementById('favorits-checkbox-id').checked = true
          }
        }
        menu.classList.add('active')
      }
    },
    hideContextMenu: function () {
      document.getElementById('favorits-menu').classList.remove('active')
    },
    fileUploadPopup: function (item) {
      let name = ''
      if (Array.isArray(item.name)) {
        name = item.name[item.name.length - 1]
      } else {
        name = item.name
      }
      this.$refs.templateTree.fileUploadPopup(item, name)
    },
    targetSearch: async function () {
      let self = this
      const targetInput = document.getElementById('targetSearchInput')
      if (self.c_node_type == []) {
        await self.nodeCodeSearch()
      }
      let code = custom.code.codeToValue(this.c_node_type, 'target')
      this.targetNodeSearch(targetInput.value, code)
    },
    nodeCodeSearch: function () {
      axios.getAsyncAxios('/v2/node/code', null, (response) => {
        if (response.data !== undefined) {
          this.c_node_type = response.data.c_node_type
          return true
        } else {
          return false
        }
      })
    },
    targetNodeSearch: function (targetName, nodeTypeCode) {
      let param = {}
      param.name = targetName
      param.nodetype = nodeTypeCode

      axios.getAsyncAxios('/v2/nodes', param, (response) => {
        if (response.data !== undefined) {
          response.data.results
        }
      })
    }
  }
}
</script>
