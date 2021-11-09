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
            <templateTree v-bind:nodeList="nodeList"/>
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
const custom = require('@/assets/js/custom.js')
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
      active: false
    }
  },
  mounted () {
    this.getTree()
  },
  methods: {
    getTree: function () {
      axios.getAsyncAxios('/v2/nodes', null, (response) => {
        console.log('response 값 : ', response)
        this.nodeList = response.data.results
        console.log('results 값 : ', custom.proxy2map(this.nodeList))
        console.log('nodes name : ', this.nodeList[0].name)
      })
    }
    // getTree: function () {
    //   axios.getSyncAxios('/v2/nodes', null, (response) => {
    //     axios.getSyncAxios('/nodes/' + response.data.result.nodename, null, (response) => {
    //       this.nodeList = response.data.results
    //     })
    //   }, function (error) {
    //     this.nodeList = []
    //     axios.setError(error.response.data)
    //   })
    // }
  }
}
</script>
