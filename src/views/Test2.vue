<template>
  <div class="backBtn" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
<div>
<h4>{{test_}}</h4>

<button v-on:click = "close">종료</button>
<h4>name : {{$route.params.name}}</h4>
<h4>age : {{$route.params.age}}</h4>
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
// let g_curWindowKey = 0
export default {
  name: 'electronTest',
  components: {
  },
  created () {
    // const self = this
    ipcRenderer.on('receiveData', this.Init)
  },
  data () {
    return {
      test_: String,
      g_windowIndex: 0,
      g_curWindowKey: ''
    }
  },
  mounted () {
    this.test_ = 'Test2 Page.'
  },
  methods: {
    Init: function (event, key, data) {
      console.log(key)
      this.g_curWindowKey = key
      console.log(data)
      ipcRenderer.send('ftp-file-upload-start')
    },
    close: function () {
      console.log('close')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
      console.log('close2')
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
    }
  }
}

</script>
