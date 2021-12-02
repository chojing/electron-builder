<template>
  <section class="userPwModify">
    <h2>비밀번호 변경</h2>
    <div class="userInfo">
      <ul>
        <li>
          <div class="flex-center">
            <b>기존 비밀번호</b>
            <input v-model="userPassword" @input="userPasswordCheckFn" class="flex-1 input-box" placeholder="기존 비밀번호" type="password">
          </div>
          <em id="errorText1" class="error"></em>
        </li>
        <li>
          <div class="flex-center">
            <b>새 비밀번호</b>
            <input v-model="newPassword" @input="newPasswordCheckFn" class="flex-1 input-box" placeholder="새 비밀번호" type="password">
          </div>
          <em id="errorText2" class="error"></em>
        </li>
        <li>
          <div class="flex-center">
            <b>새 비밀번호</b>
            <input v-model="newPasswordCheck" @input="newPasswordCheckFn2" class="flex-1 input-box" placeholder="새 비밀번호 확인" type="password">
          </div>
          <em id="errorText3" class="error"></em>
        </li>
      </ul>
      <div class="center mt30">
        <button @click="passwordModify" type="button" class="btn blue h30">저장</button>
        <button @click="cancel" type="button" id="cancel" class="btn h30">취소</button>
      </div>
    </div>
  </section>
</template>

<script>
const { axios, ipcRenderer } = require('@/assets/js/include.js')
export default {
  name: 'UserPwModify',
  data () {
    return {
      g_curWindowKey: '',
      parentKey: '',
      userRealname: this.$store.state.realname,
      userPw: '',
      userId: '',
      userPassword: '',
      newPassword: '',
      newPasswordCheck: ''
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
    ipcRenderer.once('login-read-result', this.loginDataPw)
    ipcRenderer.send('login-read')
  },
  mounted () {
  },
  methods: {
    loginDataPw: function (event, _loginData) {
      this.userId = _loginData.id
      this.userPw = _loginData.pw
    },
    userPasswordCheckFn: function () {
      const ERROR_TEXT_1 = document.getElementById('errorText1')
      if (this.userPw === this.userPassword) {
        ERROR_TEXT_1.style.display = 'none'
      } else {
        ERROR_TEXT_1.style.display = 'block'
        ERROR_TEXT_1.innerHTML = '비밀번호가 일치하지 않습니다.'
      }
    },
    newPasswordCheckFn: function () {
      const ERROR_TEXT_2 = document.getElementById('errorText2')
      console.log('기존', this.newPassword)
      console.log('새비번', this.newPasswordCheck)
      if (!/^[a-z0-9_-]{3,13}$/.test(this.newPassword)) {
        ERROR_TEXT_2.style.display = 'block'
        ERROR_TEXT_2.innerHTML = '최소 3자리 이상 입력해주세요.'
      } else {
        ERROR_TEXT_2.style.display = 'none'
      }
      this.newPasswordCheckFn2()
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
    passwordModify: function () {
      const ERROR_TEXT_1 = document.getElementById('errorText1')
      if (!this.userPassword || !this.newPassword || !this.newPasswordCheck) {
        ipcRenderer.send('alert','필수 입력 사항입니다.')
      }
      if (this.userPw === this.userPassword && this.newPassword === this.newPasswordCheck) {
        ERROR_TEXT_1.style.display = 'none'
        let self = this
        const param = {}
        const name = this.userId
        param.oldpassword = this.userPw
        param.password = this.newPassword
        param.realname = this.userRealname
        console.log('비번 일치', param)
        axios.putAsyncAxios('/v2/users/' + name + '/' + 'password', '', param, function (response) {
          ipcRenderer.send('alert','비밀번호가 변경되었습니다.')
          const data = true
          ipcRenderer.send('sendData', 'main', data, 'isUserPwModifyClose')
          ipcRenderer.send('closeWindow', self.g_curWindowKey)
        })
      } else {
        ERROR_TEXT_1.style.display = 'block'
        ERROR_TEXT_1.innerHTML = '비밀번호가 일치하지 않습니다.'
      }
    },
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.parentKey = data.parentKey
        this.g_curWindowKey = key
      }
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    }
  }
}
</script>
