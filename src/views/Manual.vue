<template>
  <div class="backBtn" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
            <h4>전송 Target</h4>
            <!--modify-->
            <router-link to="/ManualFtp"><button class="btn h30">등록</button></router-link>
          </div>
        </div>
        <div class="target-list" style="background: #f1fbff;">
          <ul class="one-list" id="targetContainer">
            <templateTree v-bind:nodeList="oneDepth"/>
          </ul>
        </div>
      </article>
    </div>
  </section>

  <templateMenu/>

</template>

<script>
import templateTree from '@/components/main/template_tree'
import templateMenu from '@/components/menu/template_menu'
const axios = require('@/assets/js/axios.js')

export default {
  name: 'Manual',
  components: {
    templateTree,
    templateMenu
  },
  data () {
    return {
      nodeList: [],
      oneDepth: [
        { nodeid: 1, parentid: 0, isfavorite: 0, isparent: 1, namevalue: '교양' },
        { nodeid: 2, parentid: 0, isfavorite: 0, isparent: 1, namevalue: '예능' },
        { nodeid: 3, parentid: 0, isfavorite: 0, isparent: 1, namevalue: '드라마' },
        { nodeid: 4, parentid: 0, isfavorite: 0, isparent: 0, namevalue: '외주제작' },
        { nodeid: 5, parentid: 0, isfavorite: 0, isparent: 1, namevalue: '종편' },
        { nodeid: 6, parentid: 0, isfavorite: 0, isparent: 0, namevalue: '부조' },
        { nodeid: 7, parentid: 0, isfavorite: 0, isparent: 0, namevalue: '색보정' },
        { nodeid: 8, parentid: 0, isfavorite: 0, isparent: 0, namevalue: '더빙' },
        { nodeid: 9, parentid: 0, isfavorite: 1, isparent: 0, namevalue: '자막' },
        { nodeid: 10, parentid: 0, isfavorite: 1, isparent: 0, namevalue: '영상편집' },
        { nodeid: 11, parentid: 0, isfavorite: 0, isparent: 0, namevalue: '교양' },
        { nodeid: 12, parentid: 0, isfavorite: 1, isparent: 0, namevalue: '예능' }
      ]
    }
  },
  mounted () {
    this.getTree()
  },
  methods: {
    getTree: function () {
      axios.getSyncAxios('/v1/trees/treename', null, function (response) {
        axios.getSyncAxios('/v1/trees/treename/' + response.data.result.rootnodeid, null, function (response) {
          this.nodeList = response.data.results
        })
      }, function (error) {
        this.nodeList = []
        axios.setError(error.response.data)
      })
    }
  }
}
</script>
