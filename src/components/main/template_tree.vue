<template>
  <li v-for="item in nodeList" v-bind:key="item.nodeid" @click="this.getChildList(item.nodeid)">
    <p v-bind:data-parentid="item.parentid" v-bind:data-nodeid="item.nodeid" v-bind:data-favorites="item.isfavorite" v-bind:data-isparent="item.isparent">{{item.namevalue}}</p>
    <ul>
      <templateTree v-bind:nodeList="twoDepth"/>
<!--      <templateTree v-bind:nodeList="childList">-->
    </ul>
  </li>
</template>

<script>
import templateTree from '@/components/main/template_tree'
const axios = require('@/assets/js/axios.js')
export default {
  name: 'template_tree',
  components: {
    templateTree
  },
  data () {
    return {
      childList: [],
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
  props: {
    nodeList: Object
  },
  methods: {
    getChildList: function (nodeid) {
      axios.getSyncAxios('/v1/trees/treename/' + nodeid + '/child', null, function (response) {
        this.childList = response.data.results
      }, function (error) {
        this.childList = []
        axios.setError(error.response.data)
      })
    }
  }
}
</script>

<style scoped>

</style>
