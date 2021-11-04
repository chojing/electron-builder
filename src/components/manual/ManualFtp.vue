<template>
  <section class="manual-ftp-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <div class="ftp-info mt20">
          <div class="btn-box right">
            <button @click="userUpData" class="btn h30">추가</button>
            <button @click="usrModifyFtp" :aria-pressed="terms ? 'true' : 'false'" id="modify-btn" class="btn blue h30">입력</button>
          </div>
          <select id="selectFtp">
            <option v-for="targetInfo in addSelect" :key="targetInfo.index" :value="targetInfo.username">{{targetInfo.username}}</option>
          </select>
          <div class="list flex-center">
            <b>이름</b>
            <div class="flex-1">
              <input v-model="username" ref="usernameInput" type="text" class="input-box name" :disabled='isDisabled'>
            </div>
          </div>
          <div class="list flex-center">
            <b>HOST</b>
            <div class="flex-1">
              <input v-model="userhost" ref="userhostInput" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>PORT</b>
            <div class="flex-1">
              <input v-model="userport" ref="userportInput" type="text" class="input-box" :disabled='isDisabled'>
            </div>
          </div>
          <div class="list flex-center">
            <b>ID</b>
            <div class="flex-1">
              <input v-model="userid" ref="useridInput" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>PW</b>
            <div class="flex-1">
              <input v-model="userpw" ref="userpwInput" type="password" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>DIR</b>
            <div class="flex-1">
              <input v-model="userdir" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>Proxy</b>
            <div class="flex-1">
              <input v-model="userproxy" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center mode">
            <b>MODE</b>
            <div class="flex-1">
              <div class="radio-input">
                <input v-model="modeValue" value="기본" type="radio" name="mode" id="basicVal" checked>
                <label for="basicVal">기본</label>
              </div>
              <div class="radio-input">
                <input v-model="modeValue" value="능동형" type="radio" name="mode" id="activeVal" :disabled='isDisabled' >
                <label for="activeVal">능동형</label>
              </div>
              <div class="radio-input">
                <input v-model="modeValue" value="수동형" type="radio" name="mode" id="passiveVal" :disabled='isDisabled' >
                <label for="passiveVal">수동형</label>
              </div>
            </div>
          </div>
      </div>
      <div class="pt20">
        <button @click="cancel" id="cancel" class="btn h30 m-auto">확인</button>
      </div>
    </div>
  </section>
</template>

<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
// eslint-disable-next-line no-unused-vars
const axios = require('@/assets/js/axios.js')
export default {
  name: 'ManualFtp',
  data () {
    return {
      terms: false,
      g_curWindowKey: '',
      // 수동 FTP 입력값
      username: '',
      userhost: '',
      userport: '21',
      userid: '',
      userpw: '',
      userdir: '',
      userproxy: '',
      modeValue: '',
      addSelect: []
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  computed: {
    isDisabled: function () {
      return !this.terms
    }
  },
  methods: {
    init: function (event, key, data, type) {
      this.g_curWindowKey = key
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    userUpData () {
      const data = []
      console.log(this.username + ' ' + this.userhost + ' ' + this.userport + ' ' + this.userid + ' ' + this.userpw + ' ' + this.userdir + ' ' + this.userproxy + ' ' + this.modeValue)
      if (!this.username) {
        alert('필수값을 입력해주세요.')
        this.$refs.usernameInput.focus()
      } else if (!this.userhost) {
        alert('필수값을 입력해주세요.')
        this.$refs.userhostInput.focus()
      } else if (!this.userid) {
        alert('필수값을 입력해주세요.')
        this.$refs.useridInput.focus()
      } else if (!this.userpw) {
        alert('필수값을 입력해주세요.')
        this.$refs.userpwInput.focus()
      } else if (!/^[0-9]*$/.test(this.userport)) {
        alert('숫자만 입력해주세요.')
        this.$refs.userportInput.focus()
      } else {
        this.addSelect.push({ username: this.username, userhost: this.userhost, userport: this.userport, userid: this.userid, userpw: this.userpw, userdir: this.userdir, userproxy: this.userproxy, modeValue: this.modeValue })
        this.terms = false
        data.push({ username: this.username, userhost: this.userhost, userport: this.userport, userid: this.userid, userpw: this.userpw, userdir: this.userdir, userproxy: this.userproxy, modeValue: this.modeValue })
        ipcRenderer.send('sendData', 'main', data, 'ftpUserAdd')
      }
    },
    usrModifyFtp () {
      this.terms = true
      this.$refs.usernameInput.focus()
    }
  }
}
</script>
