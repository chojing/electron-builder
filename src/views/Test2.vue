<template>
  <div class="backBtn" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
<div>
<h4>{{test_}}</h4>
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
  },
  data () {
    return {
      test_: String,
      g_windowIndex: 0
    }
  },
  mounted () {
    this.test_ = 'Test2 Page.'
  },
  methods: {
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
