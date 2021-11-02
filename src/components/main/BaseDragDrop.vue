<template>
      <h4>파일(폴더) 전송</h4>
      <div class="file-drag-box mb20" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop">
        <div class="drag">
          <label for="file">
            <div v-for="fileItem in fileList" :key="fileItem.index" class="fileName">
              <span>{{fileItem.fileName}}</span>
              <button @click="fileDel(fileItem, index)">X</button>
            </div>
          </label>
        </div>
        <input type="file" id="file" name="file" @change="onUpload" multiple/>
      </div>
</template>

<script>
const fileList = []
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
        this.$emit('valueReturn', fileList)
        this.fileList = []
        for (let i = 0; i < fileList.length; i++) {
          this.fileName = fileList[i].fileName
          this.fileList.push({ fileName: this.fileName })
          console.log('filename : ', this.fileName)
        }
      }
    },
    fileDel (fileItem, index) {
      this.fileList.splice(index, 1)
      console.log('파일삭제후', this.fileList)
      this.$emit('valueReturn', this.fileList)
    }
  }
}
</script>
