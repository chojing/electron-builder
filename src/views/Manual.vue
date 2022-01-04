<template>
  <section class="file-container">
    <div class="wrap">
      <div class="tti manual-tti">
        <ul class = "tabMenu">
          <li @click="goUser" :class="{active:this.$route.name === 'UserManage'}"><p>내 정보</p></li>
          <li @click="goTel" :class="{active:this.$route.name === 'UserTel'}"><p>내 연락처</p></li>
          <li @click="goFtp" :class="{active:this.$route.name === 'FTPManage'}"><p>사용자(FTP)</p></li>
        </ul>
        <button class="refresh-btn" @click="refresh"><i class="fas fa-sync-alt"></i></button>
      </div>
      <router-view ref="manual"/>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateMenu from '@/components/menu/Template_menu'
export default {
  name: 'ManualFTP',
  components: {
    templateMenu
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: 'main'
    }
  },
  mounted () {
    this.goUser()
  },
  methods: {
    init: function (event, key, data, type) {
    },
    goUser: function () {
      this.$router.push('user')
    },
    goTel: function () {
      this.$router.push('userTel')
    },
    goFtp: function () {
      this.$router.push('ftp')
    },
    refresh: function () {
      let curRouteName = this.$route.name
      if (curRouteName === 'UserManage') {
        this.$router.go()
      } else if (curRouteName === 'UserTel') {
        this.$route.matched[1].instances.default.getUserList()
      } else if (curRouteName === 'FTPManage') {
        this.$route.matched[1].instances.default.getList()
      }
    }
  }
}
</script>
