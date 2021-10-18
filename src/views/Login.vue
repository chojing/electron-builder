<template>
  <div style="margin-top:100px;">
    <header>
      <div class="logo">
        <svg fill="#fff" xmlns="http://www.w3.org/2000/svg" class="gnb_sbs_slogo_w" width="40" height="23" viewBox="0 0 30 13"><g transform="translate(0 0)"><path class="a" d="M606.579,49.226,603.4,46.4h0a1.012,1.012,0,0,1-.36-.763,1.123,1.123,0,0,1,1.166-1.07h3.515V43.089h-5.376a2.843,2.843,0,0,0-3.054,2.8,2.664,2.664,0,0,0,.8,1.889L603.84,51.2a1.094,1.094,0,0,1,.411,1.171c-.217.729-1.172.729-1.532.729h-3.425v2.989h5.2a3.656,3.656,0,0,0,3.808-3.483v-.028a4.234,4.234,0,0,0-1.721-3.351" transform="translate(-599.293 -43.089)"></path><path class="a" d="M679.5,49.226l-3.177-2.83h0a1,1,0,0,1-.362-.763,1.123,1.123,0,0,1,1.165-1.07h3.515V43.089h-5.376a2.844,2.844,0,0,0-3.055,2.8,2.66,2.66,0,0,0,.8,1.889l3.745,3.426a1.1,1.1,0,0,1,.411,1.171c-.219.729-1.173.729-1.533.729h-3.426v2.989h5.2a3.656,3.656,0,0,0,3.808-3.483v-.028a4.231,4.231,0,0,0-1.719-3.351" transform="translate(-651.221 -43.089)"></path><path class="a" d="M644.372,52.351a3.785,3.785,0,0,0-2.7-3.662,2.675,2.675,0,0,0,2.069-2.743,2.645,2.645,0,0,0-1.15-2.182,4.954,4.954,0,0,0-2.522-.621l0,0h-5.932l0,12.984h6.312a4.567,4.567,0,0,0,2.567-.887A3.8,3.8,0,0,0,644.372,52.351Zm-7.028-7.727h1.425c.218,0,1.706,0,1.828,1.405.089,1.007-.618,1.637-1.761,1.637h-1.493Zm1.713,8.513h-1.713V49.679h1.646c.214,0,1.874,0,2,1.6A1.742,1.742,0,0,1,639.057,53.137Z" transform="translate(-624.106 -43.125)"></path></g></svg>
      </div>
    </header>
    <section class="login-container">
      <div class="wrap">
        <div class="login-info">
          <span>
            <label> id </label>
            <input id="id-id" name="idInput" type="text"/>
          </span>
          <span>
            <label> pw </label>
            <input id="pw-id" name="pwInput" type="password"/>
            <em id="errorText"></em>
          </span>
        </div>
        <div class="auto-login">
          <label for="autologin-checkbox-id"> auto login
            <input id = "autologin-checkbox-id" type="checkbox"/>
          </label>
        </div>
        <div>
          <button id="json-id" @click="this.login">Login</button>
        </div>
      </div>
    </section>
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
    // auto login check
    ipcRenderer.on('login-read-result', function (event, _loginData) {
      console.log('read-result', _loginData)
      const ID = document.getElementById('id-id')
      const PW = document.getElementById('pw-id')

      if (_loginData === undefined) {
        return
      }
      // 로그인 데이터정보값이 있으면 아이디의 value값으로 들어간다(?)
      if (_loginData.id !== undefined) {
        ID.value = _loginData.id

        if (_loginData.pw !== undefined) {
          PW.type = 'password'
          // PW.value = _loginData.pw;
        }
      }
      if (_loginData.autologin !== undefined) {
        // 자동로그인기록이 있으면 true로 받아와서 checked에 true값을 준다 (?) => autologin체크박스가 체크됨
        // false일 경우 자동체크가 되지않음.
        document.getElementById('autologin-checkbox-id').checked = _loginData.autologin
        if (_loginData.autologin) {
          // 자동로그인 체크시
          this.login()
        } else if (!_loginData.autologin) {
          // 자동로그인 비체크시
        }
      }
    })
    // JSON Test
    // 로그인 버튼
    ipcRenderer.send('login-read') // 로그인 데이터를 받아옴
  },
  methods: {
    LoginInfo: function (_id, _pw, _autologin) {
      this.id = _id || ''
      this.pw = _pw || ''
      this.autologin = _autologin || false
    },
    login: async function () {
      // auto login check
      const isAutoLogin = document.getElementById('autologin-checkbox-id').checked
      const ID = document.getElementById('id-id')
      const PW = document.getElementById('pw-id')
      const ERROR_TEXT = document.getElementById('errorText')
      const lginInfo = new this.LoginInfo(ID.value, PW.value, isAutoLogin)

      // //SearchAPI
      // const restApiInfo = new RESTAPIInfo()
      // const apikey = await restApiInfo.login(ID.value, PW.value)

      axios.login(ID.value, PW.value)
      const apikey = axios.getAPIKey()
      console.log(apikey)

      // Result
      if (apikey !== undefined) {
        // g_apikey = apikey.result.apikey
        location.replace('login_success.html')
        ipcRenderer.send('login-write', lginInfo)
      } else {
        console.log(location.search)

        const urlsp = window.location.search.split('?')
        const urlError = urlsp[1]

        if (urlError === 'error') {
          // alert('로그인정보를 확인해주세요.');
          // PW.focus();
          PW.setAttribute('autofocus', 'autofocus')
          ERROR_TEXT.style.display = 'block'
          ERROR_TEXT.innerHTML = '로그인 정보를 확인해주세요.'
        }
      }
    }
  }
}
</script>
