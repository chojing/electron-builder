<!-- 전송내역 -->
<template>
  <tr v-for="item in transferDetailList" v-bind:key="item.id">
    <td>{{item.ftpservername}}</td>
    <td>{{item.filename}}</td>
    <td>{{item.filesize}}</td>
  </tr>
  <tr v-show="isShow">
    <td colspan="2">조회 결과가 없습니다.</td>
  </tr>
</template>

<script>
export default {
  props: {
    transferDetailList: Array,
    isShow: Boolean
  }
}
</script>
