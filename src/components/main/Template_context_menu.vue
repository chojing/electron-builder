<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" :nodeid="nodeid" @click="fileUploadPopup">
      <i class="fas fa-circle mr5"></i>
      전송
    </li>
    <li class = "favorits-menu-list" :nodeid="nodeid" :isFavorits="isFavorits" v-show="isMain" @click="editFavoritsMenu($event)">
<!--      <input id = "favorits-checkbox-id" type="checkbox" class ="mr5"/>-->
      <template :class="{hide : isFavorits, show : !isFavorits}">
        즐겨찾기 해제
      </template>
      <template :class="{hide : !isFavorits, show : isFavorits}">
        즐겨찾기 추가
      </template>
    </li>
  </ul>
</template>

<script>
const { ipcRenderer, axios } = require('@/assets/js/include.js')
export default {
  name: 'Template_favorits_menu',
  props: {
    username: String,
    nodeid: String,
    pathftpserverid: Number,
    pathftpsiteid: Number,
    nodename: String,
    nodepath: String,
    isFavorits: Boolean,
    isMain: Boolean
  },
  methods: {
    editFavoritsMenu: function (e) {
      // var isFavorits = document.getElementById('favorits-checkbox-id').checked
      console.log('this', this.isFavorits)
      var param = {}
      param.alias = '' // 추후 변경
      if (!this.isFavorits) { // 즐겨찾기 추가
        axios.postAsyncAxios('/v2/users/' + this.username + '/favorits/' + this.nodeid, null, param, (response) => {
          // console.log('post', response)
          let msg = '즐겨찾기가 추가되었습니다.'
          ipcRenderer.send('alert', msg)
          this.$parent.getFavorits()
        })
      } else if (this.isFavorits) { // 즐겨찾기 삭제
        axios.deleteAsyncAxios('/v2/users/' + this.username + '/favorits/' + this.nodeid, null, null, (response) => {
          // console.log('delete', response)
          let msg = '즐겨찿기가 해제되었습니다.'
          ipcRenderer.send('alert', msg)
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
      data.nodepath = this.nodepath
      this.$parent.fileUploadPopup(data)
      this.$parent.hideContextMenu()
    }
  },
  watch: {
  }
}
</script>

<style scoped>

</style>
