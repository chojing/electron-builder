<template>
  <main id="mainView">
    <div class="wrap">
      <h2>Anywhere 통합전송시스템</h2>
      <div class="head-top mt20">
        <div>
          <div class="user-name">
            <p><i class="fas fa-user"></i> Master</p>
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
            <li v-for="item in oneDepth" v-bind:key="item.nodeid">
              <p class="one-depth" v-bind:data-parentid="item.parentid" v-bind:data-nodeid="item.nodeid" v-bind:data-favorites="item.isfavorite" v-bind:data-isparent="item.isparent">{{item.namevalue}}</p>
              <ul class="two-list">
                <li>
                  <p class="two-depth"></p>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </main>

  <div class="main">
    <button id="login-btn" @click="this.loginPage">로그인페이지확인용</button>
  </div>

</template>
<script>
export default {
  name: 'Main',
  el: '#mainView',
  data () {
    return {
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
  methods: {
    loginPage: async function () {
      this.$router.push('/login')
    }
  }
}
</script>
