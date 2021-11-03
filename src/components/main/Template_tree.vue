<template>
  <li v-for="item in nodeList" v-bind:key="item.nodeid" @click="this.getChildList(item)">
    <p @dblclick="this.FileUploadPopup(item.namevalue)" v-bind:data-parentid="item.parentid" v-bind:data-nodeid="item.nodeid" v-bind:data-favorites="item.isfavorite" v-bind:data-isparent="item.isparent">{{item.namevalue}}</p>
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
// const axios = require('@/assets/js/axios.js')
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
      twoDepth: [
        { nodeid: 13, parentid: 1, isfavorite: 1, isparent: 0, namevalue: '교양1' },
        { nodeid: 14, parentid: 1, isfavorite: 0, isparent: 0, namevalue: '교양2' },
        { nodeid: 15, parentid: 1, isfavorite: 0, isparent: 0, namevalue: '교양3' },
        { nodeid: 16, parentid: 2, isfavorite: 0, isparent: 0, namevalue: '예능1' },
        { nodeid: 17, parentid: 2, isfavorite: 0, isparent: 0, namevalue: '예능2' },
        { nodeid: 18, parentid: 3, isfavorite: 1, isparent: 0, namevalue: '드라마1' },
        { nodeid: 19, parentid: 3, isfavorite: 0, isparent: 0, namevalue: '드라마2' },
        { nodeid: 20, parentid: 3, isfavorite: 0, isparent: 0, namevalue: '드라마3' },
        { nodeid: 21, parentid: 5, isfavorite: 0, isparent: 0, namevalue: '동물농장1' },
        { nodeid: 22, parentid: 5, isfavorite: 1, isparent: 0, namevalue: '동물농장2' }
      ]
    }
  },
  methods: {
    getChildList: function (item) {
      item.childList = this.twoDepth
      // axios.getSyncAxios('/v2/trees/treename/' + nodeid + '/child', null, function (response) {
      //   this.childList = response.data.results
      // }, function (error) {
      //   this.childList = []
      //   axios.setError(error.response.data)
      // })
    },
    FileUploadPopup: function (namevalue) {
      const data = {
        value: namevalue
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

<style scoped>

</style>
