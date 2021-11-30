<template>
  <div>
      <h4>전송제목</h4>
      <div class="file-tti-box mb40">
        <input class="input-box" type="text" value="" ref="title" :disabled='isDisabled' @change="onChange">
      </div>
      <h4>Optional(요청내역)</h4>
      <div class="file-list-box mb20">
        <textarea ref="comment" :disabled='isDisabled' @change="onChange"></textarea>
      </div>
      <div class="flex-center">
        <h4>파일(폴더) 전송</h4>
        <div class="file-select mb10">
          <input type="file" id="file" name="file" @change="onUpload" multiple/>
          <label for="file" class="btn h30">파일선택</label>
          <input type="file" id="folder" name="folder" @change="onUpload" webkitdirectory multiple/>
          <label for="folder" class="btn h30">폴더선택</label>
        </div>
      </div>
      <div class="file-drag-box mb20" @dragover.prevent @dragenter.prevent @drop.prevent="onDrop" :class="isDisabled ? 'disabled' : ''">
        <div class="drag">
          <div v-for="fileItem in fileListVue" :key="fileItem.index" class="fileName">
            <span>{{fileItem.fileName}}</span>
            <button @click="btn_Del_Click(fileItem)">X</button>
          </div>
        </div>
<!--        <input type="file" id="file" name="file" @change="onUpload" multiple/>-->
      </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('@/assets/js/include.js')
let fileList = []
let isSubDirFileRead = true
export default {
  name: 'BaseDragDrop',
  props: {
    isUploading: Boolean,
    isUploadComplete: Boolean
  },
  created () {
    ipcRenderer.on('open-dialog-result', this.DragDropFile_result)
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
      let files = event.target.files
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const inputfile = {
            fileName: '',
            key: '',
            path: '',
            size: 0
          }
          const file = files[i]
          if (event.target.id === 'folder') {
            inputfile.fileName = file.webkitRelativePath
          } else {
            inputfile.fileName = file.name
          }
          inputfile.path = file.path
          inputfile.size = file.size

          fileList.push(inputfile)
        }
        ipcRenderer.send('drag-file', fileList, isSubDirFileRead)
        // this.printList()
        // this.$emit('valueReturn', fileList)
      }
      event.target.value = ''
    },
    DragDropFile (files) {
      console.log('folder')
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          fileList.push(files[i].path)
        }
      }
      ipcRenderer.send('drag-file', fileList, isSubDirFileRead)

    //   // console.log(files)
    //   if (files.length) {
    //     for (let i = 0; i < files.length; i++) {
    //       const inputfile = {
    //         fileName: '',
    //         key: '',
    //         path: '',
    //         size: 0
    //       }
    //       const file = files[i]
    //       inputfile.path = file.path
    //       inputfile.fileName = file.name
    //       inputfile.size = file.size
    //       fileList.push(inputfile)
    //     }
    //     this.printList()
    //     this.$emit('valueReturn', fileList)
    //   }
    },
    onChange () {
      this.$emit('valueReturn', fileList)
    },
    DragDropFile_result (event, isCancel, FileDatas, isFileOver) {
      console.log('isCancel : ', isCancel)
      console.log('FileDatas : ', FileDatas)
      if (isFileOver == true) {
        alert('파일은 100개를 초과할 수 없습니다.')
      }
      fileList = FileDatas
      this.printList()
      this.$emit('valueReturn', fileList)
    },
    btn_Del_Click (fileItem) {
      this.delFileList(fileItem)
      this.printList()
      this.$emit('valueReturn', fileList)
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
