<template>
  <section class="manual-ftp-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP 관리</h4>
      <div class="ftp-info mt20">
        <div class="btn-box right">
          <button @click="newFtpAdd" class="btn h30" dataname="newBtn">추가</button>
          <button @click="usrModifyFtp" :aria-pressed="terms ? 'true' : 'false'" ref="btnToggle" id="modify-btn" class="btn blue h30" dataname="addBtn">수정</button>
        </div>
        <select id="selectFtp" @change="selected" v-model="ftpSelected" :disabled='!isDisabled'>
          <option v-for="item in addSelect" :key="item.index">{{item.name}}</option>
          <option v-if="!isDisabled">사용자 지정</option>
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
      <div class="btn-box center pt20">
        <button @click="cancel" id="cancel" class="btn h30">닫기</button>
        <button @click="userUpData" class="btn h30">저장</button>
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
      parentKey: '',
      // 수동 FTP 입력값
      ftpInfo: {
        ftpserverid: '',
        name: '',
        host: '',
        port: '21',
        username: '',
        password: '',
        rootpath: '',
        proxy: '',
        mode: 'active',
        ismanual: 1,
        owner: 'konan',
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
    this.getList()
  },
  computed: {
    isDisabled: function () {
      return !this.terms
    }
  },
  methods: {
    getList: function () {
      const param = {}
      const condition = {}
      condition.owner = this.$store.state.userid
      condition.ismanual = 1
      param.condition = condition
      const sort = {}
      sort.createtime = 'desc'
      param.sort = sort
      param.limit = 0
      param.offset = 0
      axios.getAsyncAxios('/v2/ftpservers', param, (response) => {
        console.log(response)
        this.addSelect = response.data.results
        this.ftpSelected = this.addSelect[0].name
        this.ftpInfo.name = this.addSelect[0].name
        this.ftpInfo.host = this.addSelect[0].host
        this.ftpInfo.port = this.addSelect[0].port
        this.ftpInfo.username = this.addSelect[0].username
        this.ftpInfo.password = this.addSelect[0].password
        this.ftpInfo.rootpath = this.addSelect[0].rootpath
        this.ftpInfo.proxy = this.addSelect[0].proxy
        this.ftpInfo.ftpserverid = this.addSelect[0].ftpserverid
      })
    },
    selected () {
      console.log('들어있는 값 확인 : ', this.addSelect)
      this.addSelect.forEach(element => {
        if (element.name == this.ftpSelected) {
          const index = this.addSelect.indexOf(element)
          console.log('선택값 확인 : ', this.addSelect[index])
          console.log('ftpserverid 확인 : ', this.addSelect[index].ftpserverid)
          this.ftpInfo.name = this.addSelect[index].name
          this.ftpInfo.host = this.addSelect[index].host
          this.ftpInfo.port = this.addSelect[index].port
          this.ftpInfo.username = this.addSelect[index].username
          this.ftpInfo.password = this.addSelect[index].password
          this.ftpInfo.rootpath = this.addSelect[index].rootpath
          this.ftpInfo.proxy = this.addSelect[index].proxy
          this.ftpInfo.ftpserverid = this.addSelect[index].ftpserverid
        }
      })
    },
    init: function (event, key, data, type) {
      if (type == 'init') {
        console.log('부모키', data)
        this.parentKey = data.parentKey
        // eslint-disable-next-line camelcase
        this.g_curWindowKey = key
      }
    },
    cancel () {
      const data = '닫힘'
      ipcRenderer.send('sendData', this.parentKey, data, 'testType')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    userUpData: function () {
      if (!this.ftpInfo.name) {
        alert('서버명을 입력해주세요.')
        this.$refs.usernameInput.focus()
      } else if (!this.ftpInfo.host) {
        alert('HOST를 입력해주세요.')
        this.$refs.userhostInput.focus()
      } else if (!this.ftpInfo.username) {
        alert('아이디를 입력해주세요.')
        this.$refs.useridInput.focus()
      } else if (!this.ftpInfo.password) {
        alert('비밀번호를 입력해주세요.')
        this.$refs.userpwInput.focus()
      } else if (!/^[0-9]*$/.test(this.ftpInfo.port)) {
        alert('PORT는 숫자만 입력해주세요.')
        this.$refs.userportInput.focus()
      } else if (this.ftpInfo.ftpserverid == '') {
        this.terms = false
        this.cancel()
        console.log('추가 ftpserverid확인 : ', this.ftpInfo.ftpserverid)
        axios.postAsyncAxios('/v2/ftpservers', JSON.stringify(this.ftpInfo), null, (response) => {
          console.log('post', response)
        })
      } else {
        this.cancel()
        console.log('수정 ftpserverid확인 : ', this.ftpInfo.ftpserverid)
        const ftpInfoData = {}
        ftpInfoData.name = this.ftpInfo.name
        ftpInfoData.host = this.ftpInfo.host
        ftpInfoData.port = this.ftpInfo.port
        ftpInfoData.username = this.ftpInfo.username
        ftpInfoData.password = this.ftpInfo.password
        ftpInfoData.rootpath = this.ftpInfo.rootpath
        ftpInfoData.proxy = this.ftpInfo.proxy
        ftpInfoData.mode = this.ftpInfo.mode
        ftpInfoData.ismanual = this.ftpInfo.ismanual
        ftpInfoData.owner = this.ftpInfo.owner
        ftpInfoData.macvolume = this.ftpInfo.macvolume
        ftpInfoData.winvolume = this.ftpInfo.winvolume
        // console.log('ftpInfoData : ', ftpInfoData)
        // console.log('ftpInfo : ', this.ftpInfo)
        axios.putAsyncAxios('/v2/ftpservers/' + JSON.stringify(this.ftpInfo.ftpserverid), JSON.stringify(ftpInfoData), null, (response) => {
          console.log('put', response)
        })
        // this.cancel()
      }
    },
    newFtpAdd () {
      this.terms = true
      this.ftpSelected = '사용자 지정'
      this.$refs.usernameInput.focus()
      this.ftpInfo.name = ''
      this.ftpInfo.host = ''
      this.ftpInfo.port = '21'
      this.ftpInfo.username = ''
      this.ftpInfo.password = ''
      this.ftpInfo.rootpath = ''
      this.ftpInfo.proxy = ''
      this.ftpInfo.ftpserverid = ''
      console.log('사용자지정 ', this.ftpInfo)
    },
    usrModifyFtp () {
      this.terms = !this.terms
      this.$refs.btnToggle.innerText = this.terms ? '취소' : '수정'
    }
  }
}
</script>
