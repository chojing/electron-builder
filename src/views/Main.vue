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
          <div class="fa-item-link fa-item flex-column"></div>
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
<!--            <templateTree v-bind:nodeList="nodeList"></templateTree>-->
            <templateTree v-bind:nodeList="oneDepth"/>
          </ul>
        </div>
      </article>
    </div>
  </main>

  <templateMenu/>

  <div class="main">
    <button id="login-btn" @click="this.loginPage">로그인페이지확인용</button>
  </div>

</template>
<script>
import templateTree from '@/components/main/template_tree'
import templateMenu from '@/components/menu/template_menu'
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
      ],
      active: false
    }
  },
  mounted () {
    this.getTree()
  },
  methods: {
    loginPage: async function () {
      this.$router.push('/login')
    },
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
