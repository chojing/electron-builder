<template>
  <section id="userAppointed-container">
    <div class="wrap">
      <h4 class="tti mb15">사용자 지정 수신 내역</h4>
      <div class="target-list mt20">
        <ul class="one-list" id="targetContainer">
          <templateTree @selectedNodeid="selectResult" :nodeList="nodeList" ref="templateTree"/>
        </ul>
      </div>
    </div>
    <div class="btn-box center pt20">
      <button @click="doClose" class="btn h30">닫기</button>
    </div>
  </section>
</template>
<script>
import templateTree from '@/components/receivedHistory/Template_tree'
const { axios, custom, ipcRenderer } = require('@/assets/js/include.js')

export default {
  components: {
    templateTree
  },
  data () {
    return {
      g_windowIndex: 0,
      parentKey: '',
      g_curWindowKey: '',
      c_node_type: [],
      nodeList: [],
      rootNodeId: 0
    }
  },
  created () {
    let self = this
    ipcRenderer.on('receiveData', self.init)
  },
  mounted () {
    this.getTree()
  },
  methods: {
    init: function (event, key, data, type) {
      this.parentKey = data.parentKey
      this.g_curWindowKey = key
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
    selectResult: function (nodeid) {
      let self = this
      let data = {}
      data.nodeid = nodeid
      ipcRenderer.send('sendData', self.parentKey, data, 'selectUserAppointed')
      ipcRenderer.send('closeWindow', self.g_curWindowKey)
    },
    doClose: function () {
      let self = this
      ipcRenderer.send('sendData', self.parentKey, null, 'closeUserAppointed')
      ipcRenderer.send('closeWindow', self.g_curWindowKey)
    }
  }
}
</script>
