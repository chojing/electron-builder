<template>
  <ul id = "favorits-menu">
    <li class = "favorits-menu-list" @click="showTransferRequest">
      <i class="fas fa-envelope-open-text mr5"></i>
      요청 상세 내역 보기
    </li>
    <li class = "favorits-menu-list" @click="fileopen">
      <i class="fas fa-folder-open mr5"></i>
      받은 파일(폴더)로 이동
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
      selected: {}
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
      this.selected = {}
      if (this.receivedList.length !== 0) {
        for (let idx in this.receivedList) {
          let item = this.receivedList[idx]
          if (item.transferid === parseInt(this.transferid)) {
            this.selected = item
            break
          }
        }
        if (this.gIsMac) {
          this.selected.volume = this.selected.macvolume
          path = this.selected.macvolume + this.selected.rootpath + this.selected.filepath
          path = path.replaceAll('\\', '/')
          path = path.replaceAll(/[/]{2,}/g, '/')
        } else if (!this.gIsMac) {
          this.selected.volume = this.selected.winvolume
          path = this.selected.winvolume + this.selected.rootpath + this.selected.filepath
          path = path.replaceAll('/', '\\')
          path = path.replaceAll('\\\\', '\\')
        }
        this.$emit('selecttransferinfo', this.selected)
        ipcRenderer.send('open-file-explore', path)
        ipcRenderer.once('open-file-explore-result', this.ftpResult)
      }
      this.$parent.hideContextMenu()
    },
    ftpResult: function (event, result) {
      // console.log('result ', result)
      let volume = this.selected.volume
      // let severname = this.selectTransferInfo.ftpservername
      let rootpath = this.selected.rootpath
      let filepath = this.selected.filepath
      let fullpath = volume + rootpath + filepath
      if (this.gIsMac) {
        fullpath = fullpath.replaceAll('\\', '/')
        fullpath = fullpath.replaceAll(/[/]{2,}/g, '/')
      } else {
        fullpath = fullpath.replaceAll('/', '\\')
        fullpath = fullpath.replaceAll('\\\\', '\\')
      }
      let msg = fullpath + ' 파일 경로가 없습니다.'
      if (result !== 'success') {
        if (volume !== undefined && fullpath !== undefined) {
          ipcRenderer.send('alert', msg)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
