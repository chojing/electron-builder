<!-- 수신내역 -->
<template>
  <tr v-for="item in receivedDetailList" v-bind:key="item.fileid">
    <td>{{item.ftpservername}}</td>
    <td>{{item.filepath}}</td>
    <td>{{item.filename}}</td>
    <td>{{item.filesize}}</td>
  </tr>
  <tr v-show="isShow">
    <td colspan="4">조회 결과가 없습니다.</td>
  </tr>
</template>

<script>
export default {
  props: {
    receivedDetailList: Array,
    isShow: Boolean
  }
}
</script>
