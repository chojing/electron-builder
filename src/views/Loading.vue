<template>
  <div class="loading">
  <h2><img style="width: 100%;" src="@/assets/images/sbspds.png" alt=""></h2>
  </div>

</template>
<script>
const { ipcRenderer, axios } = require('@/assets/js/include.js')

export default {
  name: 'Loading',
  created () {
    ipcRenderer.send('WriteLog', 'Loading Start')
    ipcRenderer.once('login-read-result', this.init)
    ipcRenderer.send('login-read') // 로그인 데이터를 받아옴
  },
  methods: {
    init: function (event, _loginData) {
      this.$store.commit('commitServer', _loginData.server)
      this.$store.commit('commitUsername', _loginData.id)
      this.$store.commit('commitAutologin', _loginData.autologin)
      this.$store.commit('commitBuildTime', _loginData.buildTime)

      if (_loginData !== undefined && _loginData.autologin && _loginData.pw) {
        // 자동로그인 체크시
        setTimeout(() => {
          this.login(_loginData.id, _loginData.pw)
        }, 3000)
      } else {
        setTimeout(() => {
          this.goTo('Login')
        }, 3000)
      }
    },
    login: async function (id, password) {
      // SearchAPI
      // const restApiInfo = new RESTAPIInfo()
      // const apikey = await restApiInfo.login(id, password)
      await axios.login(id, password)
      const apikey = this.$store.state.apikey
      // Result
      if (apikey !== null) {
        this.$router.push('/main')
      } else {
        this.$router.push('/login?error')
      }
    },
    goTo: function (page) {
      this.$router.push(page)
    }
  }
}
</script>
