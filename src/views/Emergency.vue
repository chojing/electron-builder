<template>
  <section class="emergency-container">
    <div class="wrap">
      <h4 class="tti">긴급전송
        <button class="refresh-btn" @click="refresh"><i class="fas fa-sync-alt"></i></button>
      </h4>
      <article class="mt10">
        <div class="search-form">
            <h4>전송 Target</h4>
        </div>
        <div class="favorite-list">
          <div class="fa-item-link fa-item flex-column h500" @click="hideContextMenu()" @contextmenu.prevent.self="hideContextMenu">
            <template v-for="item in nodeList" v-bind:key="item.nodeid">
              <div :data-nodeid="item.nodeid" :data-haschild="item.haschild"
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
    </div>
  </section>
  <templateMenu/>
  <templateContextMenu :nodeid="nodeid" :nodename="nodename" :nodepath="nodepath"
                       :pathftpserverid="pathftpserverid" :pathftpsiteid="pathftpsiteid" :isMain="isMain"/>
</template>
<script>
import templateMenu from '@/components/menu/Template_menu'
import templateContextMenu from '@/components/main/Template_context_menu'
const { ipcRenderer, axios, custom } = require('@/assets/js/include.js')
export default {
  name: 'Emergency',
  components: {
    templateMenu,
    templateContextMenu
  },
  data () {
    return {
      g_windowIndex: 0,
      nodeList: [],
      nodeid: null,
      pathftpserverid: null,
      pathftpsiteid: null,
      nodename: null,
      nodepath: null,
      isMain: false
    }
  },
  mounted () {
    this.getTree()
  },
  methods: {
    getTree: function () {
      axios.getAsyncAxios('/v2/node/code', {}, (response) => {
        console.log()
        this.c_node_type = response.data.c_node_type
        let param = {}
        param.nodetype = custom.code.codeToValue(this.c_node_type, 'emergency')
        axios.getAsyncAxios('/v2/nodes/tree', param, (response) => {
          let tempList = []
          if (response.data !== undefined) {
            if (Object.keys(response.data.results).length !== 0) {
              if (typeof response.data.results === 'object') {
                tempList.push(response.data.results)
              } else {
                tempList = response.data.results
              }
              for (let i = 0; i < tempList.length; i++) {
                this.findEmergencyLastTarget(tempList[i])
              }
              console.log(this.nodeList)
              for (let i = 0; i < this.nodeList.length; i++) {
                let resultTarget = this.nodeList[i]
                if (resultTarget !== undefined) {
                  this.nodeList[i] = resultTarget
                  let hasDepth = resultTarget.pathname
                  ipcRenderer.send('WriteLog', 'hasDepth')
                  ipcRenderer.send('WriteLog', hasDepth)
                  if (hasDepth.indexOf('>') !== -1) {
                    var str = hasDepth.split('>')
                    this.nodeList[i].name = str
                  }
                }
              }
            } else {
              this.nodeList = []
            }
          }
        })
      })
    },
    findEmergencyLastTarget: function (target) {
      if (target.haschild_boolean == false) {
        if (target.nodetype_code == 'target') {
          this.nodeList.push(target)
        }
      } else {
        if (target.children !== undefined) {
          let cnt = target.children.length
          if (cnt > 0) {
            for (let i = 0; i < cnt; i++) {
              this.findEmergencyLastTarget(target.children[i])
            }
          }
        }
      }
    },
    fileUploadPopup: function (ftpInfoItem) {
      const ftpInfo = custom.proxy2map(ftpInfoItem)

      let ftpServerId = ftpInfo.pathftpserverid
      let ftpSiteId = ftpInfo.pathftpsiteid
      let paramData = {}
      if (ftpInfo.isinheritance == 0) {
        ftpInfo.nodepath = ftpInfo.path
      } else if (ftpInfo.isinheritance == 1) {
        ftpInfo.nodepath = ftpInfo.pathinheritance
      }
      if (ftpServerId == 0 && ftpSiteId == 0) {
        ipcRenderer.send('alert', '조회할 FTP정보가 없습니다.')
      } else if (ftpServerId > 0) {
        axios.getAsyncAxios('/v2/ftpservers/' + ftpServerId, null, (response) => {
          paramData.serverlist = [response.data.result]
          if (ftpInfo.nodeid) {
            paramData.nodeid = ftpInfo.nodeid
          }
          paramData.nodepath = ftpInfo.nodepath
          paramData.isSite = false
          this.callFileUploadPopup(paramData)
        })
      } else if (ftpSiteId > 0) {
        axios.getAsyncAxios('/v2/ftpsites/' + ftpSiteId, null, (response) => {
          paramData.site = response.data.result
          axios.getAsyncAxios('/v2/ftpsites/' + ftpSiteId + '/ftpservers', null, (response) => {
            paramData.serverlist = response.data.results
            paramData.nodename = name
            if (ftpInfo.nodeid) {
              paramData.nodeid = ftpInfo.nodeid
            }
            paramData.nodepath = ftpInfo.nodepath
            paramData.isSite = true
            this.callFileUploadPopup(paramData)
          })
        })
      }
    },
    showContextMenu: function (e) {
      this.nodeid = ''
      if (e.currentTarget.dataset.nodeid == undefined) {
        this.hideContextMenu()
      }
      if (e.currentTarget.dataset.haschild == 0 && e.currentTarget.dataset.nodeid) {
        var menu = document.getElementById('favorits-menu')
        menu.style.left = e.pageX + 'px'
        menu.style.top = e.pageY + 'px'
        if ((e.currentTarget.dataset.haschild == 0 && e.currentTarget.dataset.nodeid)) {
          this.nodeid = e.currentTarget.dataset.nodeid
          this.pathftpserverid = parseInt(e.currentTarget.dataset.pathftpserverid)
          this.pathftpsiteid = parseInt(e.currentTarget.dataset.pathftpsiteid)
          this.nodename = e.currentTarget.dataset.name
          if (e.currentTarget.dataset.isinheritance == 0) {
            this.nodepath = e.currentTarget.dataset.path
          } else if (e.currentTarget.dataset.isinheritance == 1) {
            this.nodepath = e.currentTarget.dataset.pathinheritance
          }
        }
        menu.classList.add('active')
      }
    },
    hideContextMenu: function () {
      document.getElementById('favorits-menu').classList.remove('active')
    },
    callFileUploadPopup: function (paramData) {
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'EmergencyFileUpLoad',
        data: paramData,
        width: 500,
        height: 700,
        parent: '',
        modal: false
      })
    },
    refresh: function () {
      this.$router.go()
    }
  }
}
</script>
