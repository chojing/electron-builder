<template>
  <div class="main">
    <h1>This is an Main page</h1>
    <button id="login-btn" @click="this.loginPage">로그인페이지확인용</button>
  </div>
</template>

<script>

export default {
  methods: {
    loginPage: async function () {
      this.$router.push('/login')
    }
  }
}
</script>
