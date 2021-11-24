<!-- 전송내역 -->
<template>
  <tr v-for="item in transferDetailList" v-bind:key="item.id">
    <td>{{item.filename}}</td>
    <td>{{item.filesize}}</td>
  </tr>
</template>

<script>
export default {
  props: {
    transferDetailList: Array
  },
  data () {
    return {
      // historyDetailList: [
      //   { id: 1, ftpSiteName: 'ftpSiteName1', serverName: '서버명', fileName: 'Test.mp4', dataPer: 30 },
      //   { id: 2, ftpSiteName: 'ftpSiteName2', serverName: '서버명', fileName: 'Test.mp4', dataPer: 40 },
      //   { id: 3, ftpSiteName: 'ftpSiteName3', serverName: '서버명', fileName: 'Test.mp4', dataPer: 45 },
      //   { id: 4, ftpSiteName: 'ftpSiteName4', serverName: '서버명', fileName: 'Test.mp4', dataPer: 52 },
      //   { id: 5, ftpSiteName: 'ftpSiteName5', serverName: '서버명', fileName: 'Test.mp4', dataPer: 55 },
      //   { id: 6, ftpSiteName: 'ftpSiteName6', serverName: '서버명', fileName: 'Test.mp4', dataPer: 70 },
      //   { id: 7, ftpSiteName: 'ftpSiteName7', serverName: '서버명', fileName: 'Test.mp4', dataPer: 100 }
      // ]
    }
  }
}
</script>
