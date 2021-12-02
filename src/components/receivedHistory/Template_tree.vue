<template>
  <div>
    <template v-for="item in nodeList" v-bind:key="item">
      <li v-if="item != undefined">
        <p @click="this.onClick(item)"
           v-bind:data-nodeid="item.nodeid"
           v-bind:data-haschild="item.haschild"
           v-bind:data-nodetype-caption="item.nodetype_caption"
           v-bind:data-isabs="item.isabs"
           v-bind:data-isabs_boolean="item.isabs_boolean"
           v-bind:data-name="item.name"
           v-bind:data-isserver="item.isserver"
           v-bind:data-isopen="item.isopen"
           >{{item.name}}</p>
        <ul v-if="item.haschild" :class="{hide:!item.isopen}">
          <templateTree @selectedNodeid="selectedNodeid" v-bind:nodeList="item.children"/>
        </ul>
      </li>
    </template>
  </div>
</template>

<script>
import templateTree from '@/components/receivedHistory/Template_tree'
// const { axios, ipcRenderer } = require('@/assets/js/include.js')
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
  methods: {
    onClick: function (item) {
      const thishaschild = item.haschild
      const thisnodetype_code = item.nodetype_code
      if (!this.timeoutId) {
        // 원클릭
        this.timeoutId = setTimeout(() => {
          if (thishaschild === 1 && thisnodetype_code !== 'target') {
            this.getChildList(item)
          }
          this.timeoutId = null
        }, 400)
      } else {
        this.selectedNodeid(item.nodeid)
        clearTimeout(this.timeoutId)
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
    selectedNodeid: function (nodeid) {
      this.$emit('selectedNodeid', nodeid)
    }
  }
}
</script>
