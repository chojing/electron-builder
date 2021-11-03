<template>
  <main id="mainView">
    <div class="wrap">
      <h2>Anywhere 통합전송시스템</h2>
      <div class="head-top mt20">
        <div>
          <div class="user-name">
            <p><i class="fas fa-user"></i> {{username}}</p>
          </div>
        </div>
      </div>
      <div class="user-favorite">
        <h4>즐겨찾기</h4>
        <div class="favorite-list">
          <div class="fa-item-link fa-item flex-column">
            <button>
              <span>1뎁스</span>
              <span>2뎁스</span>
              <span>3뎁스</span>
            </button>
          </div>
        </div>
      </div>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
            <h4>전송 Target</h4>
            <div class="search-btn"><button @click="active = !active" :aria-pressed="active ? 'true' : 'false'"><i class="fas fa-search"></i></button></div>
          </div>
          <div class="search-box mt10 mb20" :class="{show:active}">
            <input type="text" placeholder="전송타겟을 입력해주세요">
          </div>
        </div>
        <div class="target-list mt40">
          <ul class="one-list" id="targetContainer">
            <templateTree v-bind:nodeList="oneDepth"/>
          </ul>
        </div>
      </article>
    </div>
  </main>
  <templateMenu/>
</template>
<script>
import templateTree from '@/components/main/Template_tree'
import templateMenu from '@/components/menu/Template_menu'
const axios = require('@/assets/js/axios.js')
export default {
  name: 'Main',
  el: '#mainView',
  components: {
    templateTree,
    templateMenu
  },
  data () {
    return {
      username: this.$store.state.username,
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
      ],
      active: false
    }
  },
  mounted () {
    this.getTree()
  },
  methods: {
    getTree: function () {
      axios.getSyncAxios('/v2/node', null, function (response) {
        axios.getSyncAxios('/v2/node/' + response.data.result.nodename, null, function (response) {
          // this.nodeList = response.data.results
        })
      }, function (error) {
        // this.nodeList = []
        console.log(error)
        console.log(error.response)
        axios.setError(error.response.data)
      })
    }
  }
}
</script>
