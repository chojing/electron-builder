<template>
  <div>
      <h4>전송제목</h4>
      <div class="file-tti-box mb40">
        <input class="input-box" type="text" value="" :disabled='isDisabled'>
      </div>
      <h4>Optional(요청내역)</h4>
      <div class="file-list-box mb20">
        <textarea :disabled='isDisabled'></textarea>
      </div>
      <h4>파일(폴더) 전송</h4>
      <div class="file-drag-box mb20" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop" :disabled='isDisabled'>
        <div class="drag">
          <label for="file">
            <div v-for="fileItem in fileListVue" :key="fileItem.index" class="fileName">
              <span>{{fileItem.fileName}}</span>
              <button @click="btn_Del_Click(fileItem)">X</button>
            </div>
          </label>
        </div>
        <input type="file" id="file" name="file" @change="onUpload" multiple/>
      </div>
  </div>
</template>

<script>
const fileList = []
export default {
  name: 'BaseDragDrop',
  props: {
    isUploading: Boolean,
    isUploadComplete: Boolean
  },
  data () {
    return {
      fileListVue: [],
      dataPer: 0
    }
  },
  computed: {
    isDisabled: function () {
      if (this.isUploading) {
        return true
      } else if (this.isUploadComplete) {
        return true
      }
      return false
    }
  },
  methods: {
    onDrop (event) {
      // console.log('onDrop', event)
      this.dataPer = 0
      this.DragDropFile(event.dataTransfer.files)
    },
    onUpload (event) {
      console.log('fileArray', fileList)
      this.dataPer = 0
      this.DragDropFile(event.target.files)
    },
    DragDropFile (files) {
      // console.log(files)
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const inputfile = {
            fileName: '',
            key: '',
            path: '',
            size: 0
          }
          const file = files[i]
          inputfile.path = file.path
          inputfile.fileName = file.name
          inputfile.size = file.size
          fileList.push(inputfile)
        }
        this.printList()
        this.$emit('valueReturn', fileList)
      }
    },
    btn_Del_Click (fileItem) {
      this.delFileList(fileItem)
      this.printList()
      this.$emit('valueReturn', this.fileListVue)
    },
    delFileList (fileItem) {
      fileList.forEach(element => {
        if (element.fileName == fileItem.fileName) {
          const index = fileList.indexOf(element)
          if (index > -1) {
            fileList.splice(index, 1)
          }
        }
      })
    },
    printList (fileItem) {
      this.fileListVue = []
      for (let i = 0; i < fileList.length; i++) {
        this.fileName = fileList[i].fileName
        this.fileListVue.push({ fileName: this.fileName })
        console.log('filename : ', this.fileName)
      }
    }
  }
}
</script>
