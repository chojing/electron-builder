<template>
  <section class="manual-ftp-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP 관리</h4>
      <div class="ftp-info mt20">
          <div class="btn-box right">
            <button class="btn h30">추가</button>
            <button @click="usrModifyFtp" :aria-pressed="terms ? 'true' : 'false'" id="modify-btn" class="btn blue h30">수정</button>
          </div>
          <select id="selectFtp">
            <option v-for="targetInfo in addSelect" :key="targetInfo.index" :value="targetInfo.username">{{targetInfo.username}}</option>
          </select>
          <div class="list flex-center">
            <b>서버명</b>
            <div class="flex-1">
              <input v-model="ftpInfo.name" ref="usernameInput" type="text" class="input-box name" :disabled='isDisabled'>
            </div>
          </div>
          <div class="list flex-center">
            <b>HOST</b>
            <div class="flex-1">
              <input v-model="ftpInfo.host" ref="userhostInput" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>PORT</b>
            <div class="flex-1">
              <input v-model="ftpInfo.port" ref="userportInput" type="text" class="input-box" :disabled='isDisabled'>
            </div>
          </div>
          <div class="list flex-center">
            <b>ID</b>
            <div class="flex-1">
              <input v-model="ftpInfo.username" ref="useridInput" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>PW</b>
            <div class="flex-1">
              <input v-model="ftpInfo.password" ref="userpwInput" type="password" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>DIR</b>
            <div class="flex-1">
              <input v-model="ftpInfo.rootpath" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center">
            <b>Proxy</b>
            <div class="flex-1">
              <input v-model="ftpInfo.proxy" type="text" class="input-box" :disabled='isDisabled' >
            </div>
          </div>
          <div class="list flex-center mode">
            <b>MODE</b>
            <div class="flex-1">
              <div class="radio-input">
                <input v-model="ftpInfo.mode" value="기본" type="radio" name="mode" id="basicVal" checked>
                <label for="basicVal">기본</label>
              </div>
              <div class="radio-input">
                <input v-model="ftpInfo.mode" value="능동형" type="radio" name="mode" id="activeVal" :disabled='isDisabled' >
                <label for="activeVal">능동형</label>
              </div>
              <div class="radio-input">
                <input v-model="ftpInfo.mode" value="수동형" type="radio" name="mode" id="passiveVal" :disabled='isDisabled' >
                <label for="passiveVal">수동형</label>
              </div>
            </div>
          </div>
      </div>
      <div class="pt20">
        <button @click="cancel" id="cancel" class="btn h30 m-auto">닫기</button>
        <button @click="userUpData" class="btn h30 m-auto">저장</button>
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
      ftpInfo: {
        name: '',
        host: '',
        port: '21',
        username: '',
        password: '',
        rootpath: '',
        proxy: '',
        mode: ''
      },
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
      // const data = []
      console.log(this.ftpInfo)
      if (!this.ftpInfo.name) {
        alert('필수값을 입력해주세요.')
        this.$refs.usernameInput.focus()
      } else if (!this.ftpInfo.host) {
        alert('필수값을 입력해주세요.')
        this.$refs.userhostInput.focus()
      } else if (!this.ftpInfo.username) {
        alert('필수값을 입력해주세요.')
        this.$refs.useridInput.focus()
      } else if (!this.ftpInfo.password) {
        alert('필수값을 입력해주세요.')
        this.$refs.userpwInput.focus()
      } else if (!/^[0-9]*$/.test(this.ftpInfo.port)) {
        alert('숫자만 입력해주세요.')
        this.$refs.userportInput.focus()
      } else {
        this.addSelect.push(this.ftpInfo)
        this.terms = false
        // data.push({ name: this.name, host: this.host, port: this.port, username: this.username, password: this.password, rootpath: this.rootpath, userproxy: this.userproxy, modeValue: this.modeValue })
        // ipcRenderer.send('sendData', 'main', data, 'ftpUserAdd')
      }
    },
    usrModifyFtp () {
      this.terms = true
      this.$refs.usernameInput.focus()
    }
  }
}
</script>
