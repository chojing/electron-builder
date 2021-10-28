<template>
  <div class="backBtn" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
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
<h4>{{test_}}</h4>
<h4>{{ftpText}}</h4>
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
      this.WriteText(this.ftpText, ftpData.errMsg)
    })

    ipcRenderer.on('ftp-message', function (event, msg) {
      this.WriteText(this.ftpText, msg)
    })
  },
  data () {
    return {
      test_: String,
      g_windowIndex: 0,
      ftpText: String,
      filename: '',
      imageSrc: ''
    }
  },
  mounted () {
    this.test_ = '안녕하세요.'
    this.ftpText = 'ftp Log Text'
  },
  methods: {
    onDrop (event) {
      this.inputFile(event.dataTransfer.files)
    },
    inputFile (files) {
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          this.filename = file.name
          console.log(this.filename)
        }
      }
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
    },
    WriteText: function (id, text) {
      id = text
    }
  }
}

</script>
