<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" @click="showTransferRequest">
      <i class="fas fa-envelope-open-text mr5"></i>
      요청내역
    </li>
    <li class = "favorits-menu-list">
      <i class="fas fa-folder-open mr5"></i>
        파일열기
    </li>
  </ul>
</template>

<script>
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  name: 'Template_context_menu',
  props: {
    receivedList: Array,
    transferid: String
  },
  methods: {
    showTransferRequest: function () {
      const data = {}
      if (this.receivedList.length !== 0) {
        for (let idx in this.receivedList) {
          let item = this.receivedList[idx]
          if (item.transferid == this.transferid) {
            data.transferRequest = item.trasnferrequest
            break
          }
        }
      }
      data.parentKey = this.selfKey
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'TransferRequest',
        data: data,
        width: 420,
        height: 365,
        parent: '',
        modal: true
      })
    }
  }
}
</script>

<style scoped>

</style>
