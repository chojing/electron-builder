<template>
  <li v-for="item in nodeList" v-bind:key="item.nodeid">
    <p @click="this.onClick(item, item.name)"
       v-bind:data-nodeid="item.nodeid"
       v-bind:data-haschild="item.haschild"
       v-bind:data-ftpserverid="item.ftpserverid"
       v-bind:data-ftpsiteid="item.ftpsiteid"
       v-bind:data-nodetype-caption="item.nodetype_caption"
       v-bind:data-isabs="item.isabs"
       v-bind:data-isabs_boolean="item.isabs_boolean"
       v-bind:data-name="item.name"
       v-bind:data-path="item.path"
       v-bind:data-isserver="item.isserver"
       v-bind:data-isopen="item.isopen"
       >{{item.name}}</p>
    <ul :class="{hide:!item.isopen}">
      <templateTree v-bind:nodeList="item.childList"/>
    </ul>
  </li>
</template>

<script>
import templateTree from '@/components/main/Template_tree'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const axios = require('@/assets/js/axios.js')
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
  methods: {
    onClick: function (item, name) {
      const thishaschild = item.haschild
      if (!this.timeoutId) {
        // 원클릭
        this.timeoutId = setTimeout(() => {
          if (thishaschild == 1) {
            this.getChildList(item)
          }
          this.timeoutId = null
        }, 400)
      } else if (!thishaschild == 1) {
        clearTimeout(this.timeoutId)
        this.FileUploadPopup(item, name)
        this.timeoutId = null
      }
    },
    getChildList: function (item) {
      const thisnodeid = item.nodeid
      if (item.isopen == undefined || item.isopen == false) {
        axios.getAsyncAxios('/v2/nodes/' + JSON.stringify(thisnodeid), null, (response) => {
          item.isopen = true
          for (const result of response.data.results) {
            if (result.isserver == true) {
              axios.getAsyncAxios('/v2/nodes/' + JSON.stringify(result.nodeid), null, (changeResponse) => {
                item.childList = changeResponse.data.results
                console.log(changeResponse.data.results)
              })
            } else {
              item.childList = response.data.results
            }
          }
        })
        return false
      } else if (item.isopen == true) {
        item.isopen = false
        return false
      }
      // axios.getSyncAxios('/v2/trees/treename/' + nodeid + '/child', null, function (response) {
      //   this.childList = response.data.results
      // }, function (error) {
      //   this.childList = []
      //   axios.setError(error.response.data)
      // })
    },
    FileUploadPopup: function (ftpInfo, name) {
      console.log('nodeList : ', this.nodeList)
      let ftpServerId = ftpInfo.path_ftpserverid
      if (ftpServerId == '') {
        alert('조회할 서버아이디가 없습니다.')
      } else {
        axios.getAsyncAxios('/v2/ftpservers/' + ftpServerId, null, (response) => {
          let data = {}
          data = response.data.result
          data.nodename = name
          if (ftpInfo.nodeid) {
            data.nodeid = ftpInfo.nodeid
          }
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
        })
      }
    }
  }
}
</script>
