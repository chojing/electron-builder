<template>
  <main id="mainView">
    <div class="wrap">
      <h4 class="tti mt10">전송</h4>
      <article class="user-name flex-box flex-center main-border">
        <p><i class="fas fa-user"></i>&ensp;{{username}} <span>({{realname}})</span></p>
        <div class="btn-box">
          <button id="logoutBtn" class="btn h30" @click="logoutCheck">Logout</button>
        </div>
      </article>
      <article class="user-favorite main-border">
        <h4 class="mt5 mb5">즐겨찾기</h4>
        <div class="favorite-list">
          <div class="fa-item-link flex-column" @click="hideContextMenu()" @contextmenu.prevent.self="hideContextMenu">
            <template v-for="item in favoritsList" v-bind:key="item.nodeid">
              <div :data-nodeid="item.nodeid" :data-favorits="item.favorits"
                   :data-pathftpserverid="item.pathftpserverid" :data-pathftpsiteid="item.pathftpsiteid"
                   :data-name="item.nodename" :data-isinheritance="item.isinheritance"
                   :data-path="item.path" :data-pathinheritance="item.pathinheritance"
                   @contextmenu.prevent="showContextMenu($event)">
                <button @dblclick="this.fileUploadPopup(item)" @click.prevent>
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
            </template>
          </div>
        </div>
      </article>
      <article class="main-border">
        <div class="search-form">
          <div class="flex-center">
            <h4>전송타겟검색</h4>
            <div class="search-btn"><button id='searchButton' @click="this.targetSearch"><i class="fas fa-search"></i></button></div>
          </div>
          <div class="search-box mt10">
            <input id='targetSearchInput' @keyup.enter="this.targetSearch" type="text" placeholder="검색">
            <div class="favorite-list">
              <div class="fa-item-link flex-column" @click="hideContextMenu()" @contextmenu.prevent.self="hideContextMenu">
                <template v-for="list in searchList" v-bind:key="list.nodeid">
                  <div v-if="!list.isEmergency" :data-nodeid="list.nodeid" :data-favorits = "list.favorits"
                       :data-pathftpserverid="list.pathftpserverid" :data-pathftpsiteid="list.pathftpsiteid"
                       :data-name="list.nodename" :data-isinheritance="list.isinheritance"
                       :data-path="list.path" :data-pathinheritance="list.pathinheritance"
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
      </article>
      <article>
        <div class="flex-center">
          <h4><i class="fas fa-circle mr5 target-circle"></i>전송 Target</h4>
          <div class="search-btn">
            <button class="refresh-btn" @click="refresh"><i class="fas fa-sync-alt"></i></button>
          </div>
        </div>
        <div class="target-list">
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
                       :pathftpserverid="pathftpserverid" :pathftpsiteid="pathftpsiteid" :isFavorits="Boolean(this.isFavorits)"
                       :isMain="isMain"/>
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
      isFavorits: false,
      isMain: true,
      isSearch: false,
      isLogoutCheck: false,
      rootNodeId: 0
    }
  },
  mounted () {
    this.getTree()
    this.getFavorits()
  },
  methods: {
    init: function (event, key, data, type) {
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
        ipcRenderer.send('alert', '네트워크 연결이 끊어졌습니다')
        isOnline = false
      }
    },
    logoutCheck: function () {
      this.isLogoutCheck = true
    },
    logout: function () {
      console.trace()
      this.$store.commit('commitApikey', '')
      axios.deleteAsyncAxios('/v2/users/apikey', null, null, (response) => {
        ipcRenderer.send('alert', '로그아웃 되었습니다.')
        this.goTo('Login?Logout')
      })
    },
    logoutCancel: function () {
      this.isLogoutCheck = false
    },
    goTo: function (page) {
      this.$router.push(page)
    },
    getTree: function () {
      axios.getAsyncAxios('/v2/node/code', {}, (response) => {
        this.c_node_type = response.data.c_node_type
        let param = {}
        param.nodetype = custom.code.codeToValue(this.c_node_type, 'normal')
        axios.getAsyncAxios('/v2/nodes/tree', param, (response) => {
          if (Object.keys(response.data.results).length !== 0) {
            for (let node of response.data.results.children) {
              node.isopen = true
            }
            this.nodeList = response.data.results.children
            this.rootNodeId = response.data.results.nodeid
          }
        })
      })
    },
    getFavorits: function () {
      axios.getAsyncAxios('/v2/users/' + this.username + '/favorits', null, (response) => {
        this.favoritsList = response.data.results
        if (this.favoritsList.length !== 0) {
          var favorits = this.favoritsList.map((obj) => obj['name'])
          // console.log('favorits : ', favorits)
          for (var idx in favorits) {
            let hasDepth = favorits[idx]
            if (hasDepth !== undefined) {
              if (hasDepth.indexOf('>') !== -1) {
                var str = hasDepth.split('>')
                // console.log('str : ', str)
                this.favoritsList[idx].name = str
                this.favoritsList[idx].nodename = str[str.length - 1]
              }
            }
          }
          for (var idy in this.favoritsList) {
            let item = this.favoritsList[idy]
            item.favorits = true
          }
        }
        // console.log('favoritsList : ', this.favoritsList)
      })
    },
    showContextMenu: function (e) {
      this.nodeid = ''
      this.isFavorits = null
      if (e.currentTarget.nodeid == undefined || e.target.dataset.nodeid == undefined) {
        this.hideContextMenu()
      }
      if ((e.target.dataset.nodeid && e.target.dataset.nodetype_code === 'target') ||
        (e.currentTarget.dataset.nodeid)) {
        var menu = document.getElementById('favorits-menu')
        menu.style.left = e.pageX + 'px'
        menu.style.top = e.pageY + 'px'
        if (e.target.dataset.nodeid && e.target.dataset.nodetype_code === 'target') {
          this.nodeid = e.target.dataset.nodeid
          this.pathftpserverid = parseInt(e.target.dataset.pathftpserverid)
          this.pathftpsiteid = parseInt(e.target.dataset.pathftpsiteid)
          this.nodename = e.target.dataset.name
          if (e.target.dataset.isinheritance == 0) {
            this.nodepath = e.target.dataset.path
          } else if (e.target.dataset.isinheritance == 1) {
            this.nodepath = e.target.dataset.pathinheritance
          }
          this.isFavorits = false
        } else if ((e.currentTarget.dataset.nodeid)) {
          this.nodeid = e.currentTarget.dataset.nodeid
          this.pathftpserverid = parseInt(e.currentTarget.dataset.pathftpserverid)
          this.pathftpsiteid = parseInt(e.currentTarget.dataset.pathftpsiteid)
          this.nodename = e.currentTarget.dataset.name
          if (e.currentTarget.dataset.isinheritance == 0) {
            this.nodepath = e.currentTarget.dataset.path
          } else if (e.currentTarget.dataset.isinheritance == 1) {
            this.nodepath = e.currentTarget.dataset.pathinheritance
          }
          this.isFavorits = false
        }
        var userFavorits = this.favoritsList.map((obj) => obj['nodeid'])
        for (var idx in userFavorits) {
          let favoritsNodeid = userFavorits[idx]
          if (this.nodeid == favoritsNodeid) {
            e.target.dataset.favorits = true
            this.isFavorits = true
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
      if (item.isinheritance == 0) {
        item.nodepath = item.path
      } else if (item.isinheritance == 1) {
        item.nodepath = item.pathinheritance
      }
      this.$refs.templateTree.fileUploadPopup(item, name)
    },
    targetSearch: async function () {
      let self = this
      const targetInput = document.getElementById('targetSearchInput')
      if (targetInput.value === '') {
        this.searchList = []
        this.isSearch = false
        return false
      }
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

            for (var target of this.searchList) {
              if (typeof target.pathnodeid == 'string' && target.pathnodeid.startsWith('/' + this.rootNodeId + '/') == true) {
                let hasDepth = target.pathname
                if (hasDepth !== undefined) {
                  if (hasDepth.indexOf('>') !== -1) {
                    var str = hasDepth.split('>')
                    // console.log('str : ', str)
                    target.name = str
                    target.nodename = str[str.length - 1]
                  }
                }
              } else {
                target.isEmergency = 1
              }
              var userFavorits = this.favoritsList.map((obj) => obj['nodeid'])
              for (var idx in userFavorits) {
                let favoritsNodeid = userFavorits[idx]
                if (target.nodeid == favoritsNodeid) {
                  target.favorits = true
                } else {
                  target.favorits = false
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
    refresh: function () {
      this.$router.go()
    }
  }
}
</script>
