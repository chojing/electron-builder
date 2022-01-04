<template>
    <div class ="main-border pb10">
      <div class="user-name flex-box flex-center mt10">
        <p><i class="fas fa-user"></i>&ensp;{{username}} <span>({{realname}})</span></p>
        <div class="btn-box">
          <button id="pwModify" class="btn h30" @click="pwModify">비밀번호 변경</button>
        </div>
      </div>
    </div>
</template>
<script>
const { axios, ipcRenderer } = require('@/assets/js/include.js')

export default {
  data () {
    return {
      g_windowIndex: 0,
      selfKey: 'main',
      /* 비밀번호 변경, 로그아웃 */
      username: this.$store.state.username,
      realname: this.$store.state.realname,
      isUserPwModifyClose: false
    }
  },
  mounted () {
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'isUserPwModifyClose') {
        this.isUserPwModifyClose = data
        if (this.isUserPwModifyClose) {
          this.logout()
        }
      }
    },
    /* 비밀번호변경, 로그아웃 */
    pwModify: function () {
      const data = {
        parentKey: this.selfKey
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'UserPwModify',
        data: data,
        width: 420,
        height: 365,
        parent: '',
        modal: true
      })
      ipcRenderer.once('receiveData', this.init)
    },
    logout: function () {
      console.trace()
      this.$store.commit('commitApikey', '')
      axios.deleteAsyncAxios('/v2/users/apikey', null, null, (response) => {
        ipcRenderer.send('alert', '로그아웃 되었습니다.')
        this.goTo('Login?Logout')
      })
    },
    goTo: function (page) {
      this.$router.push(page)
    }
  }
}
</script>
