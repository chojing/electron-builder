<!-- 전송내역 -->
<template>
  <tr v-for="item in transferList" v-bind:key="item.id">
    <td @click="historyDetailPopup(item.transfername, item.transferid)" class="targetName">{{item.transfername}}</td>
    <td>{{item.root}}</td>
    <td>{{item.filesize}}</td>
    <td>
      <div>
        <div class="pro-bar">
          <span :class = "item.status_code" :style="{width:item.dataPer + '%'}"></span>
          <template v-if="item.status >= 2000 && item.status < 3000">
            <b>{{item.dataPer}}%</b>
          </template>
          <template v-else>
            <b>{{item.status_caption}}</b>
          </template>
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
export default {
  props: {
    transferList: Array
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: 'main',
      targetNameValue: ''
    }
  },
  methods: {
    init: function (event, key, data) {
      this.targetNameValue = data.value
    },
    historyDetailPopup: function (transfername, transferid) {
      const data = {
        parentKey: this.g_curWindowKey,
        transfername: transfername,
        transferid: transferid
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
