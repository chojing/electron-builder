<template>
  <section class="userInfo-container pd40">
    <div class="wrap">
      <div class="info-box">
        <div class="btn-box mb20">
          <button @click="active = !active" :aria-pressed="active ? 'true' : 'false'" type="button" class="btn blue addUser">+</button>
          <button @click="userDel" type="button" class="btn deleteUser">-</button>
        </div>
        <table class="mb20">
          <colgroup>
            <col width="30px">
            <col width="20%">
            <col width="*">
          </colgroup>
          <thead>
            <tr>
              <th>
                <div class="check">
                  <input type="checkbox" id="allCheck" v-model="selectAll">
                  <label for="allCheck"></label>
                </div>
              </th>
              <th class="name">이름</th>
              <th>연락처</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.memberid">
              <td>
                <div class="check"><input type="checkbox" v-model="selected" :value="user.phonenumber" :id="user.memberid"><label :for="user.memberid"></label></div>
              </td>
              <td class="name">{{user.name}}</td>
              <td class="tel">{{user.phonenumber}}</td>
            </tr>
          </tbody>
        </table>
        <div class="btn-box">
          <button @click="submit" type="button" id="submitBtn" class="btn blue">확인</button>
          <button @click="cancel" type="button" id="cancel" class="btn">닫기</button>
        </div>
      </div>
    </div>
  </section>

  <div class="bg" :class="{view:active}"></div>
  <div class="user-info-add" :class="{view:active}">
    <div class="inner">
      <button @click="active = false" class="close"><i class="fas fa-times"></i></button>
      <div class="box flex-box mb20">
        <input v-model="name" ref="usernameInput" type="text" placeholder="이름" id="info-name" class="name">
        <input v-model="phonenumber" ref="usertelInput" type="tel" placeholder="연락처" id="info-tel">
      </div>
      <div class="btn-box">
        <button @click="userAdd" id="addCheck" class="btn" type="button" >추가</button>
      </div>
    </div>
  </div>
</template>

<script>
const { axios, ipcRenderer, log } = require('@/assets/js/include.js')
export default {
  name: 'UserInfo',
  data () {
    return {
      active: false,
      g_curWindowKey: '',
      parentKey: '',
      users: [],
      selected: []
    }
  },
  created () {
    log.info('UserInfo create')
    ipcRenderer.on('receiveData', this.init)
  },
  computed: {
    selectAll: {
      get () {
        return this.users ? this.selected.length === this.users.length : false
      },
      set (value) {
        var selected = []
        if (value) {
          this.users.forEach(function (user) {
            selected.push(user.phonenumber)
            console.log('유저번호=id: ' + user.phonenumber)
            console.log('전체체크한 유저정보: ' + selected)
          })
        }
        this.selected = selected
      }
    }
  },
  methods: {
    // 값 넘기는 부분
    init: function (event, key, data, type) {
      if (type == 'init') {
        console.log('부모키', data)
        this.parentKey = data.parentKey
        // eslint-disable-next-line camelcase
        this.g_curWindowKey = key
      }
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    submit: function () {
      const data = []
      this.selected.forEach(userTelData => {
        data.push(userTelData)
      })
      // key, data, type
      ipcRenderer.send('sendData', this.parentKey, data, 'userTelData')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    userAdd: function () {
      if (!/^[a-z0-9_-]{8,13}$/.test(this.phonenumber)) {
        alert('숫자만 입력해주세요.(8~13자리)')
        this.$refs.usertelInput.focus()
      } else if (!this.phonenumber) {
        alert('연락처를 입력해주세요.')
        this.$refs.usertelInput.focus()
      } else if (!this.name) {
        alert('이름을 입력해주세요.')
        this.$refs.usernameInput.focus()
      } else {
        this.active = false
        let body = {
          name: this.name,
          phonenumber: this.phonenumber,
          userid: this.$store.state.username
        }
        axios.postAsyncAxios('/v2/members', JSON.stringify(body), null, function (response) {

        })
        this.name = ''
        this.phonenumber = ''
      }
    },
    userDel: function () {
      this.selected.forEach(seleted => {
        this.users.forEach(user => {
          if (user.usertel == seleted) {
            const index = this.users.indexOf(user)
            if (index > -1) {
              this.users.splice(index, 1)
            }
          }
        })
      })
      this.selected = []
    }
  }
}
</script>
