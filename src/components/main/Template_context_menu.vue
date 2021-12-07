<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" :nodeid="nodeid" @click="fileUploadPopup">
      전송
    </li>
    <li class = "favorits-menu-list" :nodeid="nodeid" v-show="isMain">
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
    pathftpserverid: Number,
    pathftpsiteid: Number,
    nodename: String,
    nodepath: String,
    isMain: Boolean
  },
  methods: {
    editFavoritsMenu: function (e) {
      var isFavorits = document.getElementById('favorits-checkbox-id').checked
      var param = {}
      param.alias = '' // 추후 변경
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
      this.$parent.hideContextMenu()
    },
    fileUploadPopup: function () {
      var data = {}
      data.pathftpserverid = this.pathftpserverid
      data.pathftpsiteid = this.pathftpsiteid
      data.nodeid = this.nodeid
      data.name = this.nodename
      data.path = this.nodepath
      this.$parent.fileUploadPopup(data)
      this.$parent.hideContextMenu()
    }
  }
}
</script>

<style scoped>

</style>
