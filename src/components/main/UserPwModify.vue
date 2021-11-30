<template>
  <section class="userPwModify">
    <h2>비밀번호 변경</h2>
    <div class="userInfo">
      <ul>
        <li class="flex-center">
          <b>기존 비밀번호</b>
          <input class="flex-1 input-box" placeholder="기존 비밀번호">
        </li>
        <li class="flex-center">
          <b>새로운 비밀번호</b>
          <input class="flex-1 input-box" placeholder="새로운 비밀번호">
        </li>
        <li class="flex-center">
          <b>새로운 비밀번호</b>
          <input class="flex-1 input-box" placeholder="새로운 비밀번호 확인">
        </li>
      </ul>
      <div class="center mt30">
        <button type="button" class="btn blue h30">확인</button>
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
  },
  methods: {
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
