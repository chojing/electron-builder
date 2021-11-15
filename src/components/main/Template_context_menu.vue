<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" :nodeid="nodeid">
      즐겨찾기
      <input id = "favorits-checkbox-id" type="checkbox" class ="ml10" @click="editFavoritsMenu($event)"/>
    </li>
  </ul>
</template>

<script>
// const axios = require('@/assets/js/axios.js')
export default {
  name: 'Template_favorits_menu',
  props: {
    username: String,
    nodeid: String
  },
  methods: {
    editFavoritsMenu: function (e) {
      var isFavorits = document.getElementById('favorits-checkbox-id').checked
      // var alias = '테스트'
      if (isFavorits) { // 즐겨찾기 추가
        alert('체크박스 체크 되어있음 ', isFavorits)
        // axios.postAsyncAxios('/v2/users/' + this.username + '/favorits/' + this.nodeid, alias, null, (response) => {
        //   console.log('post', response)
        // })
      } else if (!isFavorits) { // 즐겨찾기 삭제
      }
    }
  }
}
</script>

<style scoped>

</style>
