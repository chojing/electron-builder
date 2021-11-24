<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" :nodeid="nodeid" @click="fileUploadPopup">
      전송
    </li>
    <li class = "favorits-menu-list" :nodeid="nodeid">
      즐겨찾기
      <input id = "favorits-checkbox-id" type="checkbox" class ="ml10" @click="editFavoritsMenu($event)"/>
    </li>
  </ul>
</template>

<script>
const axios = require('@/assets/js/axios.js')
export default {
  name: 'Template_favorits_menu',
  props: {
    username: String,
    nodeid: String,
    path_ftpserverid: Number,
    nodename: String
  },
  methods: {
    editFavoritsMenu: function (e) {
      var isFavorits = document.getElementById('favorits-checkbox-id').checked
      var param = {}
      param.alias = 'tteesstt' // 추후 변경
      if (isFavorits) { // 즐겨찾기 추가
        axios.postAsyncAxios('/v2/users/' + this.username + '/favorits/' + this.nodeid, null, param, (response) => {
          // console.log('post', response)
          this.$parent.getFavorits()
        })
      } else if (!isFavorits) { // 즐겨찾기 삭제
        axios.deleteAsyncAxios('/v2/users/' + this.username + '/favorits/' + this.nodeid, null, null, (response) => {
          // console.log('delete', response)
          this.$parent.getFavorits()
        })
      }
    },
    fileUploadPopup: function () {
      // console.log('this.path_ftpserverid : ', this.path_ftpserverid)
      var data = {}
      data.path_ftpserverid = this.path_ftpserverid
      data.nodeid = this.nodeid
      data.name = this.nodename
      this.$parent.FileUploadPopup(data)
    }
  }
}
</script>

<style scoped>

</style>
