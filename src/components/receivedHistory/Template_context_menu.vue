<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" @click="showTransferRequest">
      <i class="fas fa-envelope-open-text mr5"></i>
      요청내역
    </li>
    <li class = "favorits-menu-list" @click="fileopen">
      <i class="fas fa-folder-open mr5"></i>
      폴더열기
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
      selfKey: 'main',
      selected: ''
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
        width: 440,
        height: 385,
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
          if (item.transferid === parseInt(this.transferid)) {
            this.selected = item
            break
          }
        }
        if (this.selected.length !== 0) {
          if (this.gIsMac) {
            this.selected.volume = this.selected.macvolume
            path = this.selected.macvolume + '/' + this.selected.filepath
          } else {
            this.selected.volume = this.selected.winvolume
            path = this.selected.winvolume + '\\' + this.selected.filepath
          }
          this.$emit('selecttransferinfo', this.selected)
          ipcRenderer.send('open-file-explore', path)
        }
      }
      this.$parent.hideContextMenu()
    }
  }
}
</script>

<style scoped>

</style>
