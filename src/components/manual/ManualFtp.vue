<template>
  <section class="manual-ftp-container">
    <div class="wrap">
      <h4 class="tti">사용자 FTP 관리</h4>
      <div class="ftp-info mt20">
        <div class="list flex-center">
          <b>서버명</b>
          <div class="flex-1">
            <input v-model="ftpInfo.name" ref="usernameInput" type="text" class="input-box name">
          </div>
        </div>
        <div class="list flex-center">
          <b>HOST</b>
          <div class="flex-1">
            <input v-model="ftpInfo.host" ref="userhostInput" type="text" class="input-box">
          </div>
        </div>
        <div class="list flex-center">
          <b>PORT</b>
          <div class="flex-1">
            <input v-model="ftpInfo.port" ref="userportInput" type="text" class="input-box">
          </div>
        </div>
        <div class="list flex-center">
          <b>ID</b>
          <div class="flex-1">
            <input v-model="ftpInfo.username" ref="useridInput" type="text" class="input-box">
          </div>
        </div>
        <div class="list flex-center">
          <b>PW</b>
          <div class="flex-1">
            <input v-model="ftpInfo.password" ref="userpwInput" type="password" class="input-box">
          </div>
        </div>
        <div class="list flex-center">
          <b>DIR</b>
          <div class="flex-1">
            <input v-model="ftpInfo.rootpath" type="text" class="input-box">
          </div>
        </div>
        <div class="list flex-center mode">
          <b>Proxy</b>
          <div class="flex-1">
            <div class="radio-input">
              <input v-model="ftpInfo.proxy" value="proxy-y" type="radio" name="proxy" id="proxy-y">
              <label for="proxy-y"> YES</label>
            </div>
            <div class="radio-input">
              <input v-model="ftpInfo.proxy" value="proxy-n" type="radio" name="proxy" id="proxy-n">
              <label for="proxy-n"> NO</label>
            </div>
          </div>
        </div>
        <div class="list flex-center mode">
          <b>MODE</b>
          <div class="flex-1">
            <div class="radio-input">
              <input v-model="ftpInfo.mode" value="normal" type="radio" name="mode" id="normal">
              <label for="normal"> 기본</label>
            </div>
            <div class="radio-input">
              <input v-model="ftpInfo.mode" value="active" type="radio" name="mode" id="active">
              <label for="active"> 능동형</label>
            </div>
            <div class="radio-input">
              <input v-model="ftpInfo.mode" value="passive" type="radio" name="mode" id="passive">
              <label for="passive"> 수동형</label>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-box center pt20">
        <button @click="userUpData" class="btn blue h30">저장</button>
        <button @click="cancel" class="btn h30" id="option-cancel-btn">취소</button>
      </div>
    </div>
  </section>
</template>

<script>
const { axios, ipcRenderer } = require('@/assets/js/include.js')
export default {
  name: 'ManualFtp',
  data () {
    return {
      g_curWindowKey: '',
      parentKey: '',
      type: '',
      selectedFtpInfo: {},
      c_ftpmode: [],
      // 사용자 FTP 입력값
      ftpInfo: {
        ftpserverid: '',
        name: '',
        host: '',
        port: '21',
        username: '',
        password: '',
        rootpath: '',
        proxy: '',
        mode: '',
        ismanual: 1,
        owner: '',
        macvolume: '',
        winvolume: ''
      },
      addSelect: [],
      ftpSelected: {}
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  mounted () {
  },
  methods: {
    init: function (event, key, data, type) {
      this.ftpInfo.owner = this.$store.state.username
      if (type == 'init') {
        // console.log('부모키', data)
        this.parentKey = data.parentKey
        this.type = data.type
        if (data.type === 'add') {
          this.newFtpAdd()
        } else if (data.type === 'modify') {
          if (data.selectedFtpInfo) {
            this.selectedFtpInfo = data.selectedFtpInfo
            this.setModify(data.selectedFtpInfo)
          }
        }
        // eslint-disable-next-line camelcase
        this.g_curWindowKey = key
      }
    },
    newFtpAdd: function () {
      this.$refs.usernameInput.focus()
      this.ftpInfo.name = ''
      this.ftpInfo.host = ''
      this.ftpInfo.port = '21'
      this.ftpInfo.username = ''
      this.ftpInfo.password = ''
      this.ftpInfo.rootpath = ''
      this.ftpInfo.proxy = 'proxy-y'
      this.ftpInfo.mode = 'normal'
      this.ftpInfo.ftpserverid = '-1'
    },
    setModify: function (ftpInfo) {
      // console.log(ftpInfo)
      this.ftpInfo.name = ftpInfo.name
      this.ftpInfo.host = ftpInfo.host
      this.ftpInfo.port = ftpInfo.port
      this.ftpInfo.username = ftpInfo.username
      this.ftpInfo.password = ftpInfo.password
      this.ftpInfo.rootpath = ftpInfo.rootpath
      this.ftpInfo.proxy = ftpInfo.proxy
      this.ftpInfo.mode = ftpInfo.mode_code
      this.ftpInfo.ftpserverid = ftpInfo.ftpserverid
    },
    userUpData: function () {
      if (!this.ftpInfo.name) {
        ipcRenderer.send('alert', '서버명을 입력해주세요.')
        this.$refs.usernameInput.focus()
      } else if (!this.ftpInfo.host) {
        ipcRenderer.send('alert', 'HOST를 입력해주세요.')
        this.$refs.userhostInput.focus()
      } else if (!this.ftpInfo.username) {
        ipcRenderer.send('alert', '아이디를 입력해주세요.')
        this.$refs.useridInput.focus()
      } else if (!this.ftpInfo.password) {
        ipcRenderer.send('alert', '비밀번호를 입력해주세요.')
        this.$refs.userpwInput.focus()
      } else if (!/^[0-9]*$/.test(this.ftpInfo.port)) {
        ipcRenderer.send('alert', 'PORT는 숫자만 입력해주세요.')
        this.$refs.userportInput.focus()
      }
      const ftpInfoData = {}
      ftpInfoData.name = this.ftpInfo.name
      ftpInfoData.host = this.ftpInfo.host
      ftpInfoData.port = this.ftpInfo.port
      ftpInfoData.username = this.ftpInfo.username
      ftpInfoData.password = this.ftpInfo.password
      ftpInfoData.rootpath = this.ftpInfo.rootpath
      ftpInfoData.proxy = this.ftpInfo.proxy
      ftpInfoData.mode = this.ftpInfo.mode
      // ftpInfoData.mode = custom.code.codeToValue(this.c_ftpmode, this.ftpInfo.mode)
      ftpInfoData.ismanual = this.ftpInfo.ismanual
      ftpInfoData.owner = this.ftpInfo.owner
      ftpInfoData.macvolume = this.ftpInfo.macvolume
      ftpInfoData.winvolume = this.ftpInfo.winvolume
      if (this.ftpInfo.ftpserverid > 0) { // 수정
        // console.log('수정 ftpserverid확인 : ', this.ftpInfo.ftpserverid)
        axios.putAsyncAxios('/v2/ftpservers/' + JSON.stringify(this.ftpInfo.ftpserverid), JSON.stringify(ftpInfoData), null, (response) => {
          // console.log('put', response)
          ipcRenderer.send('alert', 'Ftp서버 수정이 완료되었습니다.')
          this.cancel()
        })
      } else { // 추가
        // console.log('추가 ftpserverid확인 : ', this.ftpInfo.ftpserverid)
        axios.postAsyncAxios('/v2/ftpservers', JSON.stringify(ftpInfoData), null, (response) => {
          // console.log('post', response)
          ipcRenderer.send('alert', 'Ftp서버 추가가 완료되었습니다.')
          this.cancel()
        })
      }
    },
    cancel: function () {
      const data = true
      ipcRenderer.send('sendData', this.parentKey, data, 'isManualFtpClose')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    }
  }
}
</script>
