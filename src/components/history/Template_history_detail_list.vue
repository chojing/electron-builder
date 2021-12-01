<!-- 전송내역 -->
<template>
  <tr v-for="item in transferDetailList" v-bind:key="item.fileid">
    <td><p class="ellipsis-w">{{item.ftpservername}}</p></td>
    <td><p class="ellipsis-w140">{{item.filepath}}</p></td>
    <td><p class="ellipsis-w">{{item.filename}}</p></td>
    <td>{{item.filesize}}</td>
  </tr>
  <tr v-show="isShow">
    <td colspan="4">조회 결과가 없습니다.</td>
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
