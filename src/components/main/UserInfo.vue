<template>
  <section class="userInfo-container pd40">
    <div class="wrap">
      <div class="info-box">
        <div class="btn-box mb20">
          <button @click="active = !active" :aria-pressed="active ? 'true' : 'false'" type="button" class="btn blue addUser">+</button>
          <button @click="userDel(key)" type="button" class="btn deleteUser">-</button>
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
            <tr v-for="user in users" :key="user.usertel">
              <td>
                <div class="check"><input type="checkbox" v-model="selected" :value="user.usertel" :id="user.usertel"><label :for="user.usertel"></label></div>
              </td>
              <td class="name">{{user.username}}</td>
              <td class="tel">{{user.usertel}}</td>
            </tr>
          </tbody>
        </table>
        <div class="btn-box">
          <button type="button" id="submitBtn" class="btn blue" @click="btn_OK">확인</button>
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
        <input v-model="username" type="text" placeholder="이름" id="info-name" class="name">
        <input v-model="usertel" type="tel" placeholder="연락처" id="info-tel">
      </div>
      <div class="btn-box">
        <button @click="userAdd" id="addCheck" class="btn" type="button" >추가</button>
      </div>
    </div>
  </div>
</template>

<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
export default {
  name: 'UserInfo',
  data () {
    return {
      active: false,
      g_curWindowKey: '',
      users: [],
      selected: []
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  computed: {
    selectAll: {
      get () {
        return this.users ? this.selected.length == this.users.length : false
      },
      set (value) {
        var selected = []
        if (value) {
          this.users.forEach(function (user) {
            selected.push(user.usertel)
            console.log('유저번호=아이디: ' + user.usertel)
            console.log('유저정보: ' + selected)
          })
        }
        this.selected = selected
      }
    }
  },
  methods: {
    init: function (event, key, data) {
      // eslint-disable-next-line camelcase
      this.g_curWindowKey = key
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    btn_OK: function () {
      // ipcRender.send('SendData', 'main', )
    },
    userAdd: function () {
      this.active = false
      this.users.push({ username: this.username, usertel: this.usertel })
      this.username = ''
      this.usertel = ''
      // console.log('이름 ' + this.username)
      // console.log('번호 ' + this.usertel)
    },
    userDel: function (index) {
      this.users.splice(index, 1)
    }
  }
}
</script>
