<!-- 전송내역 -->
<template>
  <tr v-for="item in historyList" v-bind:key="item.id">
    <td @click="historyDetailPopup(item.ftpName)" class="targetName">{{item.ftpName}}</td>
    <td>{{item.root}}</td>
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
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
export default {
  data () {
    return {
      g_curWindowKey: 0,
      targetNameValue: '',
      historyList: [
        { id: 1, ftpName: 'ftpName1', root: '/root/rootA', fileName: 'fileName1', dataPer: 10 },
        { id: 2, ftpName: 'ftpName2', root: '/root/rootB', fileName: 'fileName2', dataPer: 30 },
        { id: 3, ftpName: 'ftpName3', root: '/root/rootC', fileName: 'fileName3', dataPer: 45 },
        { id: 4, ftpName: 'ftpName4', root: '/root/rootD', fileName: 'fileName4', dataPer: 52 },
        { id: 5, ftpName: 'ftpName5', root: '/root/rootE', fileName: 'fileName5', dataPer: 60 },
        { id: 6, ftpName: 'ftpName6', root: '/root/rootF', fileName: 'fileName6', dataPer: 80 },
        { id: 7, ftpName: 'ftpName7', root: '/root/rootG', fileName: 'fileName7', dataPer: 100 }
      ]
    }
  },
  methods: {
    init: function (event, key, data) {
      this.targetNameValue = data.value
    },
    historyDetailPopup: function (ftpName) {
      const data = {
        value: ftpName
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'HistoryDetail',
        data: data,
        width: 600,
        height: 700,
        parent: '',
        modal: true
      })
    }
  }
}
</script>
