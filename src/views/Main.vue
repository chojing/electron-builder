<template>
  <main id="mainView">
    <div class="wrap">
      <h2>Anywhere 통합전송시스템</h2>
      <div class="head-top mt20">
        <div>
          <div class="user-name flex-box flex-center">
            <p><i class="fas fa-user"></i> {{username}} <span>({{realname}})</span></p>
            <div class="btn-box">
              <button id="pwModify" class="btn h30" @click="pwModify">비밀번호 변경</button>
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
            <div class="search-btn"><button id='searchButton' @click="this.searchBtnClick" :aria-pressed="active ? 'true' : 'false'"><i class="fas fa-search"></i></button></div>
          </div>
          <div class="search-box mt10 mb20" :class="{show:active}">
            <input id='targetSearchInput' @keyup.enter="this.targetSearch" type="text" placeholder="전송타겟을 입력해주세요">
            <div class="favorite-list">
              <div class="fa-item-link fa-item flex-column" @click="hideContextMenu()" @contextmenu.prevent.self="hideContextMenu">
                <template v-for="list in searchList" v-bind:key="list.nodeid">
                  <div :data-nodeid="list.nodeid" :data-haschild="list.haschild"
                       :data-pathftpserverid="list.pathftpserverid" :data-pathftpsiteid="list.pathftpsiteid"
                       :data-name="list.nodename" :data-path="list.path"
                       @contextmenu.prevent="showContextMenu($event)">
                    <button @dblclick="this.fileUploadPopup(list)">
                      <template v-if="Array.isArray(list.name)">
                        <template v-for="item in list.name" v-bind:key="item">
                          <span>
                            {{item}}
                          </span>
                        </template>
                      </template>
                      <template v-else>
                        <span>
                          {{list.name}}
                        </span>
                      </template>
                    </button>
                  </div>
                </template>
                <template v-if="(Object.keys(this.searchList).length === 0) && isSearch">
                  <span>검색 결과가 없습니다.</span>
                </template>
              </div>
            </div>
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
        <button class="btn h30 blue" @click="logoutCancel">취소</button>
      </div>
    </div>
    <div class="bg view" v-show="isLogoutCheck"></div>
  </main>
  <templateMenu/>
  <templateContextMenu :nodeid="nodeid" :username="username" :nodename="nodename" :nodepath="nodepath"
                       :pathftpserverid="pathftpserverid" :pathftpsiteid="pathftpsiteid" :isMain="isMain"/>
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
    ipcRenderer.once('offline_result', this.offlineResult)
  },
  data () {
    return {
      g_windowIndex: 0,
      username: this.$store.state.username,
      realname: this.$store.state.realname,
      c_node_type: [],
      favoritsList: [],
      searchList: [],
      nodeList: [],
      nodeid: null,
      pathftpserverid: null,
      pathftpsiteid: null,
      nodename: null,
      nodepath: null,
      isMain: true,
      active: false,
      isSearch: false,
      isUserPwModifyClose: false,
      isLogoutCheck: false
    }
  },
  mounted () {
    this.getTree()
    this.getFavorits()
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'isUserPwModifyClose') {
        this.isUserPwModifyClose = data
        if (this.isUserPwModifyClose) {
          this.logout()
        }
      }
    },
    pwModify: function () {
      const data = {
        parentKey: this.selfKey
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'UserPwModify',
        data: data,
        width: 350,
        height: 400,
        parent: '',
        modal: true
      })
      ipcRenderer.once('receiveData', this.init)
    },
    logoutCheck: function () {
      this.isLogoutCheck = true
    },
    logout: function () {
      console.trace()
      this.$store.commit('commitApikey', '')
      axios.deleteAsyncAxios('/v2/users/apikey', null, null, (response) => {
        alert('로그아웃 되었습니다.')
        this.goTo('Login?Logout')
      })
    },
    logoutCancel: function () {
      this.isLogoutCheck = false
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
      if (e.currentTarget.nodeid == undefined || e.target.dataset.nodeid == undefined) {
        this.hideContextMenu()
      }
      if ((e.target.dataset.haschild == 0 && e.target.dataset.nodeid) ||
        (e.currentTarget.dataset.haschild == 0 && e.currentTarget.dataset.nodeid)) {
        var menu = document.getElementById('favorits-menu')
        menu.style.left = e.pageX + 'px'
        menu.style.top = e.pageY + 'px'
        if (e.target.dataset.haschild == 0 && e.target.dataset.nodeid) {
          this.nodeid = e.target.dataset.nodeid
          this.pathftpserverid = parseInt(e.target.dataset.pathftpserverid)
          this.pathftpsiteid = parseInt(e.target.dataset.pathftpsiteid)
          this.nodename = e.target.dataset.name
          this.nodepath = e.target.dataset.path
        } else if ((e.currentTarget.dataset.haschild == 0 && e.currentTarget.dataset.nodeid)) {
          this.nodeid = e.currentTarget.dataset.nodeid
          this.pathftpserverid = parseInt(e.currentTarget.dataset.pathftpserverid)
          this.pathftpsiteid = parseInt(e.currentTarget.dataset.pathftpsiteid)
          this.nodename = e.currentTarget.dataset.name
          this.nodepath = e.currentTarget.dataset.path
        }
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
      param.name_keyword = targetName
      param.nodetype = nodeTypeCode
      axios.getAsyncAxios('/v2/nodes', param, (response) => {
        if (response.data !== undefined) {
          if (Object.keys(response.data.results).length !== 0) {
            this.searchList = response.data.results
            // console.log('if ', response.data.results)
            var target = this.searchList.map((obj) => obj['pathname'])
            for (var idx in target) {
              let hasDepth = target[idx]
              if (hasDepth !== undefined) {
                if (hasDepth.indexOf('>') !== -1) {
                  var str = hasDepth.split('>')
                  // console.log('str : ', str)
                  this.searchList[idx].name = str
                  this.searchList[idx].nodename = str[str.length - 1]
                }
              }
            }
          } else {
            this.searchList = []
          }
        }
        this.isSearch = true
      })
    },
    searchBtnClick: function () {
      this.active = !this.active
      this.isSearch = false
      const targetInput = document.getElementById('targetSearchInput')
      targetInput.value = ''
      targetInput.placeholder = '전송타겟을 입력해주세요'
      this.searchList = []
    }
  }
}
</script>
