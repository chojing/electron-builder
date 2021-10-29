<template>
      <h4>파일(폴더) 전송</h4>
      <div class="file-drag-box mb20" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop">
        <div class="drag">

        </div>
      </div>
</template>

<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
export default {
  name: 'BaseDragDrop',
  props: {
  },
  data () {
    return {
      fileList: [],
      dataPer: 0
    }
  },
  created () {
    ipcRenderer.on('open-dialog-result', this.DragDropFile_Result)
  },
  methods: {
    onDrop (event) {
      this.dataPer = 0
      this.DragDropFile(event.dataTransfer.files)
    },
    DragDropFile (files) {
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          this.fileList.push(file.path)
          console.log(this.fileList)
        }
        const convertFileList = this.fileList.map(f => f) // serialize 조건 충족
        ipcRenderer.send('drag-file', convertFileList)
        this.fileList = []
      }
    },
    DragDropFile_Result (event, _isCancel, _fileData) {
      if (_isCancel == true) {
        this.$emit('valueReturn', '취소하였습니다.')
        return
      }
      if (_fileData === undefined) {
        this.$emit('valueReturn', '파일을 가져오는 중 에러가 발생했습니다.')
        return
      }
      this.$emit('valueReturn', _fileData)
    }
  }
}
</script>
