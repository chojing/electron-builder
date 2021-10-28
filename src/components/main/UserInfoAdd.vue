<template>
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
export default {
  name: 'UserInfoAdd',
  data () {
    return {
      active: false,
      username: '',
      usertel: ''
    }
  },
  methods: {
    userAdd: function () {
      this.active = false
      console.log('이름 ' + this.username)
      console.log('번호 ' + this.usertel)
    }
  }
}
</script>
