<template>
  <section class="userPwModify">
    <h2>비밀번호 변경</h2>
    <div class="userInfo">
      <ul>
        <li>
          <div class="flex-center">
            <b>기존 비밀번호</b>
            <input v-model="userPassword" class="flex-1 input-box" placeholder="기존 비밀번호">
          </div>
          <em id="errorText1" class="error"></em>
        </li>
        <li>
          <div class="flex-center">
            <b>새 비밀번호</b>
            <input v-model="newPassword" @input="newPasswordCheckFn" class="flex-1 input-box" placeholder="새 비밀번호">
          </div>
          <em id="errorText2" class="error"></em>
        </li>
        <li>
          <div class="flex-center">
            <b>새 비밀번호</b>
            <input v-model="newPasswordCheck" @input="newPasswordCheckFn2" class="flex-1 input-box" placeholder="새 비밀번호 확인">
          </div>
          <em id="errorText3" class="error"></em>
        </li>
      </ul>
      <div class="center mt30">
        <button @click="passwordModify" type="button" class="btn blue h30">확인</button>
        <button @click="cancel" type="button" id="cancel" class="btn h30">취소</button>
      </div>
    </div>
  </section>
</template>

<script>
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  name: 'UserPwModify',
  data () {
    return {
      g_curWindowKey: ''
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
    ipcRenderer.once('login-read-result', this.passwordModify)
    ipcRenderer.send('login-read')
  },
  mounted () {
  },
  methods: {
    newPasswordCheckFn: function () {
      const ERROR_TEXT_2 = document.getElementById('errorText2')
      if (!/^[a-z0-9_-]{3,13}$/.test(this.newPassword)) {
        ERROR_TEXT_2.style.display = 'block'
        ERROR_TEXT_2.innerHTML = '최소 3자리 이상 입력해주세요.'
      } else {
        ERROR_TEXT_2.style.display = 'none'
      }
    },
    newPasswordCheckFn2: function () {
      const ERROR_TEXT_3 = document.getElementById('errorText3')
      if (this.newPasswordCheck === this.newPassword) {
        ERROR_TEXT_3.style.display = 'none'
      } else {
        ERROR_TEXT_3.style.display = 'block'
        ERROR_TEXT_3.innerHTML = '비밀번호가 일치하지 않습니다.'
      }
    },
    passwordModify: function (event, _loginData) {
      console.log('기존 비밀번호 : ', this.userPassword)
      console.log('새 비밀번호 : ', this.newPassword)
      console.log('새 비밀번호확인 : ', this.newPasswordCheck)
      console.log('_loginData.pw', _loginData.pw)
      if (!this.userPassword || !this.newPassword || !this.newPasswordCheck) {
        alert('필수 입력 사항입니다.')
      }
    },
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.g_curWindowKey = key
      }
    },
    cancel: function () {
      // const data = true
      // ipcRenderer.send('sendData', this.parentKey, data, 'isManualFtpClose')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    }
  }
}
</script>
