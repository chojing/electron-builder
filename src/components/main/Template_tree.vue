<template>
  <div>
    <template v-for="item in nodeList" v-bind:key="item">
      <li v-if="item != undefined">
        <p @click="this.onClick(item, item.name)"
           v-bind:data-nodeid="item.nodeid"
           v-bind:data-haschild="item.haschild"
           v-bind:data-ftpserverid="item.ftpserverid"
           v-bind:data-ftpsiteid="item.ftpsiteid"
           v-bind:data-nodetype-caption="item.nodetype_caption"
           v-bind:data-nodetype_code="item.nodetype_code"
           v-bind:data-isabs="item.isabs"
           v-bind:data-isabs_boolean="item.isabs_boolean"
           v-bind:data-name="item.name"
           v-bind:data-path="item.path"
           v-bind:data-isserver="item.isserver"
           v-bind:data-isopen="item.isopen"
           v-bind:data-pathftpserverid="item.pathftpserverid"
           v-bind:data-pathftpsiteid="item.pathftpsiteid"
           >{{item.name}}</p>
        <ul v-if="item.haschild" :class="{hide:!item.isopen}">
          <templateTree v-bind:nodeList="item.children"/>
        </ul>
      </li>
    </template>
  </div>
</template>

<script>
import templateTree from '@/components/main/Template_tree'
const { axios, ipcRenderer } = require('@/assets/js/include.js')
export default {
  name: 'templateTree',
  components: {
    templateTree
  },
  props: {
    nodeList: Object
  },
  data () {
    return {
      g_windowIndex: 0,
      timeoutId: null
    }
  },
  created () {
    // console.log('nodelist : ', this.nodeList)
    if (this.nodeList && this.nodeList.length > 0) {
      for (let node of this.nodeList) {
        let servernodeList = []
        // node.isopen = true
        if (node != undefined) {
          if (node.haschild) {
            for (let childnode of node.children) {
              if (childnode != undefined) {
                if (childnode.isserver) {
                  servernodeList.push(childnode)
                }
              }
            }
          }
          if (servernodeList.length > 0) {
            for (let servernode of servernodeList) {
              let index = node.children.indexOf(servernode)
              // server 삭제
              node.children.splice(index, 1)
              // server 삭제한 위치로 slice
              let preList = node.children.splice(index)
              // server의 children을 server위치에 concat
              preList = preList.concat(servernode.children)
              node.children = preList.concat(node.children)
            }
          }
        }
      }
    }
  },
  // setup (props) {
  //   console.log('test2', props.nodeList)
  //   for (let test of props.nodeList) {
  //     console.log('test', test)
  //     // eslint-disable-next-line vue/no-setup-props-destructure
  //     test = props.nodeList
  //   }
  // },
  methods: {
    onClick: function (item, name) {
      const thishaschild = item.haschild
      // const thisnodetype_code = item.nodetype_code
      if (!this.timeoutId) {
        // 원클릭
        this.timeoutId = setTimeout(() => {
          if (thishaschild === 1) {
            this.getChildList(item)
          }
          this.timeoutId = null
        }, 400)
      } else if (thishaschild !== 1) {
        clearTimeout(this.timeoutId)
        this.fileUploadPopup(item, name)
        this.timeoutId = null
      }
    },
    getChildList: function (item) {
      if (item.isopen == true) {
        console.log('click')
        item.isopen = false
        return false
      } else if (item.isopen == undefined || item.isopen == false) {
        item.isopen = true
        return false
      }
      // if (item.isopen == undefined || item.isopen == false) {
      //   axios.getAsyncAxios('/v2/nodes/' + JSON.stringify(thisnodeid), null, (response) => {
      //     item.isopen = true
      //     for (const result of response.data.results) {
      //       if (result.isserver == true) {
      //         axios.getAsyncAxios('/v2/nodes/' + JSON.stringify(result.nodeid), null, (changeResponse) => {
      //           item.childList = changeResponse.data.results
      //           console.log(changeResponse.data.results)
      //         })
      //       } else {
      //         item.childList = response.data.results
      //       }
      //     }
      //   })
      //   return false
      // } else if (item.isopen == true) {
      //   item.isopen = false
      //   return false
      // }
      // axios.getSyncAxios('/v2/trees/treename/' + nodeid + '/child', null, function (response) {
      //   this.childList = response.data.results
      // }, function (error) {
      //   this.childList = []
      //   axios.setError(error.response.data)
      // })
    },
    fileUploadPopup: function (ftpInfo, name) {
      console.log(ftpInfo)
      let ftpServerId = ftpInfo.pathftpserverid
      let ftpSiteId = ftpInfo.pathftpsiteid
      if (ftpServerId == 0 && ftpSiteId == 0) {
        ipcRenderer.send('alert', '조회할 FTP정보가 없습니다.')
      } else if (ftpServerId > 0) {
        axios.getAsyncAxios('/v2/ftpservers/' + ftpServerId, null, (response) => {
          let data = {}
          data.serverlist = [response.data.result]
          data.nodename = name
          if (ftpInfo.nodeid) {
            data.nodeid = ftpInfo.nodeid
          }
          data.nodepath = ftpInfo.path
          data.isSite = false
          this.callFileUploadPopup(data)
        })
      } else if (ftpSiteId > 0) {
        axios.getAsyncAxios('/v2/ftpsites/' + ftpSiteId, null, (response) => {
          let data = {}
          data.site = response.data.result
          axios.getAsyncAxios('/v2/ftpsites/' + ftpSiteId + '/ftpservers', null, (response) => {
            data.serverlist = response.data.results
            data.nodename = name
            if (ftpInfo.nodeid) {
              data.nodeid = ftpInfo.nodeid
            }
            data.nodepath = ftpInfo.path
            data.isSite = true
            this.callFileUploadPopup(data)
          })
        })
      }
    },
    callFileUploadPopup: function (data) {
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'MainFileUpLoad',
        data: data,
        width: 500,
        height: 800,
        parent: '',
        modal: false
      })
      console.log('data send : ', data)
    }
  }
}
</script>
