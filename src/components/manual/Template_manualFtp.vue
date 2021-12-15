<template ref="manualFtp">
  <article class="mt10">
    <div class="search-form">
      <div class="flex-center">
        <h4>전송 Target</h4>
        <!--modify-->
        <button class="btn h30" @click="manualFtpPopup">관리</button>
      </div>
    </div>
    <div class="target-list h500 mt10" style="background: #f5f5f5;border-radius: 5px;">
      <ul class="one-list">
        <li v-for="item in targetFtpList" v-bind:key="item.ftpserferid" @dblclick="this.fileUploadPopup(item)">
          <p>{{item.name}}</p>
        </li>
      </ul>
    </div>
  </article>
</template>

<script>
const { ipcRenderer, axios, custom } = require('@/assets/js/include.js')
export default {
  components: {
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: 'main',
      targetFtpList: [],
      isManualFtpClose: false
    }
  },
  mounted () {
    this.getList()
  },
  created () {
    console.log('start!')
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'isManualFtpClose') {
        this.isManualFtpClose = data
        if (this.isManualFtpClose) {
          this.getList()
        }
      }
    },
    getList: function () {
      this.targetFtpList = []
      const param = {}
      const condition = {}
      condition.owner = this.$store.state.username
      condition.ismanual = 1
      param.condition = condition
      const sort = {}
      sort.createtime = 'desc'
      param.sort = sort
      param.limit = 0
      param.offset = 0
      axios.getAsyncAxios('/v2/ftpservers', param, (response) => {
        this.targetFtpList = response.data.results
      })
    },
    manualFtpPopup: function () {
      const data = {
        parentKey: this.selfKey
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'ManualFtp',
        data: data,
        width: 600,
        height: 700,
        parent: '',
        modal: false
      })
    },
    fileUploadPopup: function (ftpInfoItem) {
      let data = {}
      data.serverlist = [ftpInfoItem]
      data.site = null
      data.isSite = false
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'ManualFileUpload',
        data: custom.proxy2map(data),
        width: 500,
        height: 700,
        parent: '',
        modal: false
      })
      console.log(ftpInfoItem)
    }
  }
}
</script>
