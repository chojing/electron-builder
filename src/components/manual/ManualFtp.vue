<template>
  <section class="manual-ftp-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP 관리</h4>
      <div class="ftp-info mt20">
        <div class="btn-box right">
          <button @click="newFtpAdd" class="btn h30" id="new-btn" dataname="newBtn" v-show="!isOptionClicked">추가</button>
          <template v-if="Object.keys(this.addSelect).length !== 0">
            <button @click="usrModifyFtp" class="btn blue h30" id="modify-btn"  dataname="addBtn" v-show="!isOptionClicked">수정</button>
          </template>
          <button @click="optionCancelClick" class="btn blue h30" id="option-cancel-btn" dataname="optionCancelBtn" v-show="isOptionClicked">취소</button>
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
              <input v-model="ftpInfo.mode" value="normal" type="radio" name="mode" id="normal" :disabled='isDisabled'>
              <label for="normal"> 기본</label>
            </div>
            <div class="radio-input">
              <input v-model="ftpInfo.mode" value="active" type="radio" name="mode" id="active" :disabled='isDisabled' >
              <label for="active"> 능동형</label>
            </div>
            <div class="radio-input">
              <input v-model="ftpInfo.mode" value="passive" type="radio" name="mode" id="passive" :disabled='isDisabled' >
              <label for="passive"> 수동형</label>
            </div>
          </div>
        </div>
      </div>
      <div class="btn-box center pt20">
        <button @click="cancel" id="cancel" class="btn h30" v-show="!isOptionClicked">닫기</button>
        <button @click="userUpData" class="btn h30" v-show="isOptionClicked">저장</button>
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
      terms: false, /* 수정 버튼 클릭 시 */
      flag: true, /* true -> 수정 버튼 클릭, false -> 추가 버튼 클릭 */
      isOptionClicked: false, /* true -> 취소/저장 버튼 보이기 , false -> 추가,수정/닫기 버튼 보이기 */
      g_curWindowKey: '',
      parentKey: '',
      c_ftpmode: [],
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
    this.getList()
  },
  computed: {
    isDisabled: function () {
      return !this.terms
    }
  },
  methods: {
    getList: function () {
      this.ftpInfo.owner = this.$store.state.username
      const param = {}
      const condition = {}
      condition.owner = this.$store.state.username
      condition.ismanual = 1
      param.condition = condition
      const sort = {}
      sort.createtime = 'desc'
      param.sort = sort
      param.limit = 0
      param.offset = 0
      console.log('condition : ', condition)
      // axios.getAsyncAxios('/v2/ftpserver/code', {}, (response) => {
      //   this.c_ftpmode = response.data.c_ftpmode
      axios.getAsyncAxios('/v2/ftpservers', param, (response) => {
        console.log('결과', response.data)
        this.addSelect = response.data.results
        if (Object.keys(response.data.results).length !== 0) {
          this.ftpSelected = this.addSelect[0].name
          this.ftpInfo.name = this.addSelect[0].name
          this.ftpInfo.host = this.addSelect[0].host
          this.ftpInfo.port = this.addSelect[0].port
          this.ftpInfo.username = this.addSelect[0].username
          this.ftpInfo.password = this.addSelect[0].password
          this.ftpInfo.rootpath = this.addSelect[0].rootpath
          this.ftpInfo.proxy = this.addSelect[0].proxy
          this.ftpInfo.mode = this.addSelect[0].mode_code
          // this.ftpInfo.mode = custom.code.valueToCode(this.c_ftpmode, this.addSelect[0].mode)
          this.ftpInfo.ftpserverid = this.addSelect[0].ftpserverid
        }
      })
      // })
    },
    selected: function () {
      // console.log('들어있는 값 확인 : ', this.addSelect)
      this.addSelect.forEach(element => {
        if (element.name == this.ftpSelected) {
          const index = this.addSelect.indexOf(element)
          // console.log('선택값 확인 : ', this.addSelect[index])
          // console.log('ftpserverid 확인 : ', this.addSelect[index].ftpserverid)
          this.ftpInfo.name = this.addSelect[index].name
          this.ftpInfo.host = this.addSelect[index].host
          this.ftpInfo.port = this.addSelect[index].port
          this.ftpInfo.username = this.addSelect[index].username
          this.ftpInfo.password = this.addSelect[index].password
          this.ftpInfo.rootpath = this.addSelect[index].rootpath
          this.ftpInfo.proxy = this.addSelect[index].proxy
          this.ftpInfo.mode = this.addSelect[index].mode_code
          // this.ftpInfo.mode = custom.code.valueToCode(this.c_ftpmode, this.addSelect[index].mode)
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
    cancel: function () {
      const data = true
      ipcRenderer.send('sendData', this.parentKey, data, 'isManualFtpClose')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    userUpData: function () {
      this.terms = true
      this.usrModifyFtp()
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
      } else if (this.ftpInfo.ftpserverid > 0) {
        console.log('수정 ftpserverid확인 : ', this.ftpInfo.ftpserverid)
        // console.log('ftpInfoData : ', ftpInfoData)
        // console.log('ftpInfo : ', this.ftpInfo)
        axios.putAsyncAxios('/v2/ftpservers/' + JSON.stringify(this.ftpInfo.ftpserverid), JSON.stringify(ftpInfoData), null, (response) => {
          // console.log('put', response)
          this.cancel()
        })
      } else {
        this.terms = false
        console.log('추가 ftpserverid확인 : ', this.ftpInfo.ftpserverid)
        axios.postAsyncAxios('/v2/ftpservers', JSON.stringify(ftpInfoData), null, (response) => {
          console.log('post', response)
          this.cancel()
        })
      }
    },
    newFtpAdd: function () {
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
      this.ftpInfo.mode = 'normal'
      this.ftpInfo.ftpserverid = '-1'
      // console.log('사용자지정 ', this.ftpInfo)

      this.isOptionClicked = true
      this.flag = false
    },
    usrModifyFtp: function () {
      this.isOptionClicked = true
      this.terms = true
      this.flag = true
    },
    optionCancelClick: function () {
      this.isOptionClicked = false
      if (this.flag) { // 수정 버튼 클릭 시
        this.terms = false
        this.selected()
      } else if (!this.flag) { // 추가 버튼 클릭 시
        this.terms = false
        if (!this.flag) {
          this.ftpSelected = this.addSelect[0].name
        }
        this.selected()
      }
    }
  }
}
</script>
