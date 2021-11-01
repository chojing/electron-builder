<template>
      <h4>파일(폴더) 전송</h4>
      <div class="file-drag-box mb20" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop">
        <div class="drag">
          <label for="file">
            <div class="fileName">
              <span>파일명파일명파일명파일명파일명파일명파일명파일명</span>
              <button>X</button>
            </div>
          </label>
        </div>
        <input type="file" id="file" name="file" @change="onChange" multiple/>
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
    //   fileList: [],
      dataPer: 0
    }
  },
  created () {
  },
  methods: {
    onDrop (event) {
      console.log('onDrop', event)
      this.dataPer = 0
      this.DragDropFile(event.dataTransfer.files)
    },
    onChange (event) {
      console.log('onChange')
      this.dataPer = 0
      this.DragDropFile(event.target.files)
    },
    DragDropFile (files) {
      console.log(files)
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
