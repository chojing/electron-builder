<template>
  <div class="loading">
  <h2><img style="width: 100%;" src="../assets/images/sbspds.png" alt=""></h2>
  </div>

</template>
<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
// const RESTAPIInfo = require('../assets/js/restapi.js').RESTAPIInfo
const axios = require('../assets/js/axios.js')

export default {
  name: 'Loading',
  created () {
    ipcRenderer.once('login-read-result', this.init)
    ipcRenderer.send('login-read') // 로그인 데이터를 받아옴
  },
  methods: {
    init: function (event, _loginData) {
      if (_loginData === undefined || _loginData.autologin === false) {
        setTimeout(() => {
          this.goTo('Login')
        }, 3000)
      } else {
        // 자동로그인 체크시
        setTimeout(() => {
          this.login(_loginData.id, _loginData.pw)
        }, 3000)
      }
    },
    login: async function (id, password) {
      // SearchAPI
      // const restApiInfo = new RESTAPIInfo()
      // const apikey = await restApiInfo.login(id, password)
      axios.login(id, password)
      const apikey = axios.getAPIKey()
      console.log(apikey)
      // Result
      if (apikey !== undefined) {
        this.$router.push('/mian')
      } else {
        this.$router.push('/login?error')
      }
    },
    goTo: function (page) {
      console.log(this)
      console.log(this.$router)
      this.$router.push(page)
    }
  }
}
</script>
