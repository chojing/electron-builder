<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" @click="showTransferRequest">
      <i class="fas fa-envelope-open-text mr5"></i>
      요청내역
    </li>
    <li class = "favorits-menu-list" @click="fileopen">
      <i class="fas fa-folder-open mr5"></i>
        파일열기
    </li>
  </ul>
</template>

<script>
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  name: 'Template_context_menu',
  emits: ['selecttransferinfo'],
  props: {
    receivedList: Array,
    transferid: String,
    gIsMac: Boolean
  },
  data () {
    return {
      g_curWindowKey: 0,
      selfKey: 'main'
    }
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
      this.$parent.hideContextMenu()
    },
    fileopen: function () {
      let path = ''
      if (this.receivedList.length !== 0) {
        for (let idx in this.receivedList) {
          let item = this.receivedList[idx]
          if (item.transferid == this.transferid) {
            if (this.gIsMac) {
              item.volume = item.macvolume
              path = item.macvolume + '/' + item.filepath
            } else {
              item.volume = item.winvolume
              path = item.winvolume + '\\' + item.filepath
            }
            this.$emit('selecttransferinfo', item)
            ipcRenderer.send('open-file-explore', path)
            break
          }
        }
      }
      this.$parent.hideContextMenu()
    }
  }
}
</script>

<style scoped>

</style>
