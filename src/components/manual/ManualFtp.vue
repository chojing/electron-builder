<template>
  <section class="manual-ftp-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <div class="ftp-info mt20">
        <div class="btn-box right">
          <button @click="userData()" class="btn h30">등록</button>
          <button @click="modifyFtp()" :aria-pressed="terms ? 'true' : 'false'" id="modify-btn" class="btn blue h30">수정</button>
        </div>
        <select name="" id="selectFtp">
          <option value="FTP정보1">FTP정보1</option>
          <option value="FTP정보2">FTP정보2</option>
          <option value="FTP정보3">FTP정보3</option>
          <option value="FTP정보4">FTP정보4</option>
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
            <input v-model="userhost" type="text" class="input-box" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>PORT</b>
          <div class="flex-1">
            <input v-model="userport" type="text" class="input-box" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>ID</b>
          <div class="flex-1">
            <input v-model="userid" type="text" class="input-box" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>PW</b>
          <div class="flex-1">
            <input v-model="userpw" type="text" class="input-box" :disabled='isDisabled' >
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
              <input v-model="basicVal" value="기본" type="radio" name="mode" id="basicVal" checked>
              <label for="basicVal">기본</label>
            </div>
            <div class="radio-input">
              <input v-model="activeVal" value="능동형" type="radio" name="mode" id="activeVal" :disabled='isDisabled' >
              <label for="activeVal">능동형</label>
            </div>
            <div class="radio-input">
              <input v-model="passiveVal" value="수동형" type="radio" name="mode" id="passiveVal" :disabled='isDisabled' >
              <label for="passiveVal">수동형</label>
            </div>
          </div>
        </div>
      </div>
      <div class="pt20">
        <button id="cancel" class="btn h30 m-auto">확인</button>
      </div>
    </div>
  </section>

  <templateMenu/>

</template>

<script>
// const electron = window.require('electron')
// const ipcRenderer = electron.ipcRenderer
// eslint-disable-next-line no-unused-vars
const axios = require('@/assets/js/axios.js')
export default {
  name: 'ManualFtp',
  data () {
    return {
      terms: false,
      // 수동 FTP 입력값
      username: '',
      userhost: '',
      userport: '',
      userid: '',
      userpw: '',
      userdir: '',
      userproxy: '',
      basicVal: '',
      activeVal: '',
      passiveVal: ''
    }
  },
  computed: {
    isDisabled: function () {
      return !this.terms
    }
  },
  methods: {
    userData () {
      this.terms = false
      console.log(this.username + ' ' + this.userhost + ' ' + this.userport + ' ' + this.userid + ' ' + this.userpw + ' ' + this.userdir + ' ' + this.userproxy)
      console.log(this.basicVal + ' ' + this.activeVal + ' ' + this.passiveVal)
    },
    modifyFtp () {
      this.terms = true
      this.$refs.usernameInput.focus()
    }
  }
}
</script>
