<template>
      <h4>파일(폴더) 전송</h4>
      <div class="file-drag-box mb20" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop">
        <div class="drag">
          <label for="file">
            <div v-for="item in fileList" :key="item.index" class="fileName">
              <span>{{ fileNameItem }}</span>
              <button>X</button>
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
      dataPer: 0,
      fileName: ''
    }
  },
  computed: {
    fileNameItem: {
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
      for (let i = 0; i < fileList.length; i++) {
        this.fileName = fileList[i].fileName
        console.log('filename : ', this.fileName)
      }
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
      }
    }
  }
}
</script>
