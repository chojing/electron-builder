<template>
  <div class="backBtn" draggable="false" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
<button v-on:click = "getKey">등록</button>
<button @click="this.newWindow">새창열기</button>
<button v-on:click = "ftpTest">ftp테스트</button>

          </div>
<div>
<h4 id = "test">{{test_}}</h4>
<h4 id = "ftpText">{{ftpText}}</h4>
</div>
<div type="text"
       class="form-control"
       @dragover.prevent
       @dragenter.prevent
       @drop.prevent="onDrop" style="border:2px solid black;border-radius:3px;padding:5px;display:inline-block">
Drag your file here
    </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
// import func from 'vue-editor-bridge'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const g_ftpSendData = { fileList: [] }
export default {
  name: 'electronTest',
  components: {
  },
  created () {
    const self = this
    ipcRenderer.on('getUserInfo_result', async function (event, _g_loginInfo) {
      console.log('Response GetAPIKey')
      console.log(_g_loginInfo)
      self.test_ = _g_loginInfo
    })

    ipcRenderer.on('ftp-error', function (event, ftpData) {
      console.log('error')
      // SetAsset(ftpData, g_CheckFTPPersentDic, 0)
      self.WriteText('ftpText', ftpData.errMsg)
    })

    ipcRenderer.on('ftp-message', function (event, msg) {
      self.WriteText('ftpText', msg)
    })

    ipcRenderer.on('open-dialog-result', function (event, _isCancel, _fileData) {
      if (_isCancel == true) {
        self.ftpText = '취소하였습니다.'
        return
      }
      if (_fileData === undefined) {
        self.ftpText = '파일을 가져오는 중 에러가 발생했습니다.'
        return
      }
      g_ftpSendData.fileList = _fileData
      self.PrintPath(_fileData)
    })
  },
  data () {
    return {
      test_: String,
      g_windowIndex: 0,
      ftpText: String,
      filename: '',
      fileList: []

    }
  },
  mounted () {
    this.test_ = '안녕하세요.'
    this.ftpText = 'ftp Log Text'
  },
  methods: {
    onDrop (event) {
      this.DragDropFile(event.dataTransfer.files)
    },
    DragDropFile (files) {
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          this.fileList.push(file.path)
        }
        const convertFileList = this.fileList.map(f => f)
        ipcRenderer.send('drag-file', convertFileList)
        this.fileList = []
      }
    },
    PrintPath: function (_fileData) {
      let strResult = ''
      for (var i = 0; i < _fileData.length; i++) {
        const file = _fileData[i]
        strResult += `You selected: ${file.path}` + `<br> You Size: ${file.size}` + '<br><br>'
        // strResult = 'test'
      }
      this.WriteText('ftpText', strResult)
    },
    WriteText: function (_id, text) {
      document.getElementById(_id).innerHTML = text
    },
    getKey: function () {
      ipcRenderer.send('getUserInfo')
      console.log('Request GetAPIKey')
    },
    newWindow: function () {
      const name = 'test'
      const data = {
        value: name
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'test2',
        data: data,
        width: 700,
        height: 700,
        parent: '',
        modal: false
      })
    },
    ftpTest: function () {
      console.log('test!')
    }
  }
}

</script>
