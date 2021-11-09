<template>
  <li v-for="item in nodeList" v-bind:key="item.nodeid" @click="this.getChildList(item)">
    <!-- 임시) 전체 값 넣어보기-->
    <p @dblclick="this.FileUploadPopup(item.name)"
       v-bind:data-isparent="item.isparent"
       v-bind:data-ftpserverid="item.ftpserverid"
       v-bind:data-ftpsiteid="item.ftpsiteid"
       v-bind:data-isabs="item.isabs"
       v-bind:data-isabs_boolean="item.isabs_boolean"
       v-bind:data-name="item.name"
       v-bind:data-nodeid="item.nodeid"
       v-bind:data-nodeseq="item.nodeseq"
       v-bind:data-parentnodeid="item.parentnodeid"
       v-bind:data-path="item.path"
       v-bind:data-path_ftpserverid="item.path_ftpserverid"
       v-bind:data-path_ftpsiteid="item.path_ftpsiteid"
       v-bind:data-isopen="item.isopen"
       >{{item.name}}</p>
    <ul>
      <templateTree v-bind:nodeList="item.childList"/>
      <!--      <templateTree v-bind:nodeList="childList">-->
    </ul>
  </li>
</template>

<script>
import templateTree from '@/components/main/Template_tree'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const axios = require('@/assets/js/axios.js')
// const custom = require('@/assets/js/custom.js')
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
      g_windowIndex: 0
    }
  },
  methods: {
    getChildList: function (item) {
      if (item.isopen == undefined) {
        const thisnodeid = item.nodeid
        axios.getAsyncAxios('/v2/nodes/' + JSON.stringify(thisnodeid), null, (response) => {
          console.log('클릭한 nodeid 값 : ', thisnodeid)
          item.childList = response.data.results
          item.isopen = true
          console.log('클릭한: ', item)
          // response.data.results.forEach(function (item, index) {
          //   console.log(index, item)
          //   console.log(item.parentnodeid)
          //   if (item.parentnodeid == thisnodeid) {
          //     console.log('같다')
          //   }
          // })
        })
      }
      return false
      // axios.getSyncAxios('/v2/trees/treename/' + nodeid + '/child', null, function (response) {
      //   this.childList = response.data.results
      // }, function (error) {
      //   this.childList = []
      //   axios.setError(error.response.data)
      // })
    },
    FileUploadPopup: function (name) {
      console.log('nodeList : ', this.nodeList)
      const data = {
        value: name
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'FileUpLoad',
        data: data,
        width: 600,
        height: 750,
        parent: '',
        modal: false
      })
      console.log('data send : ', data)
    }
  }
}
</script>
