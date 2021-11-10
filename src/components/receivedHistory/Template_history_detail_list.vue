<!-- 수신내역 -->
<template>
  <tr v-for="item in historyDetailList" v-bind:key="item.id">
    <td>{{item.ftpSiteName}}</td>
    <td>{{item.serverName}}</td>
    <td>{{item.fileName}}</td>
    <td>
      <div>
        <div class="pro-bar">
          <span :style="{width:item.dataPer + '%'}"></span>
          <b>{{item.dataPer}}%</b>
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
export default {
  data () {
    return {
      historyDetailList: [
        { id: 1, ftpSiteName: 'ftpSiteName1', serverName: '서버명', fileName: 'Test.mp4', dataPer: 30 },
        { id: 2, ftpSiteName: 'ftpSiteName2', serverName: '서버명', fileName: 'Test.mp4', dataPer: 40 },
        { id: 3, ftpSiteName: 'ftpSiteName3', serverName: '서버명', fileName: 'Test.mp4', dataPer: 45 },
        { id: 4, ftpSiteName: 'ftpSiteName4', serverName: '서버명', fileName: 'Test.mp4', dataPer: 52 },
        { id: 5, ftpSiteName: 'ftpSiteName5', serverName: '서버명', fileName: 'Test.mp4', dataPer: 55 },
        { id: 6, ftpSiteName: 'ftpSiteName6', serverName: '서버명', fileName: 'Test.mp4', dataPer: 70 },
        { id: 7, ftpSiteName: 'ftpSiteName7', serverName: '서버명', fileName: 'Test.mp4', dataPer: 100 }
      ]
    }
  }
}
</script>
