<template>
  <section class="file-container">
    <div class="wrap">
      <div class="tti manual-tti">
        <ul class = "tabMenu">
          <li @click="goUser" :class="{active:this.active}"><p>내 정보</p></li>
          <li @click="goFtp" :class="{active:!this.active}"><p>사용자(FTP)</p></li>
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
      selfKey: 'main',
      active: Boolean
    }
  },
  mounted () {
    this.goUser()
  },
  methods: {
    init: function (event, key, data, type) {
    },
    goUser: function () {
      this.active = true
      this.$router.push('user')
    },
    goFtp: function () {
      this.active = false
      this.$router.push('ftp')
    },
    refresh: function () {
      let curRouteName = this.$route.name
      if (curRouteName === 'UserManage') {
        this.$router.go()
      } else if (curRouteName === 'FTPManage') {
        this.$route.matched[1].instances.default.getList()
      }
    }
  }
}
</script>
