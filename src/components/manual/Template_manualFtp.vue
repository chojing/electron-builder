<template ref="manualFtp">
  <article class="manualFtp mt10">
    <div class="search-form">
      <div class="flex-center">
        <h4>전송 Target</h4>
        <!--modify-->
        <div>
          <button class="btn blue h30" @click="manualFtpPopup('add')">추가</button>
          <button class="btn blue h30" @click="manualFtpPopup('modify')">편집</button>
          <button class="btn h30" @click="deleteManualFtp">삭제</button>
        </div>
      </div>
    </div>
    <div class="target-list h500 mt10" style="background: #f5f5f5;border-radius: 5px;">
      <ul class="one-list">
        <li v-for="item in targetFtpList" v-bind:key="item.ftpserverid"
            :class="{active:this.selectedFtpInfo.ftpserverid === item.ftpserverid}"
            @click="selectedFtp(item)"
            @dblclick="this.fileUploadPopup(item)" :data-ismanual="item.ismanual">
          <p v-bind:data-ismanual="item.ismanual" :data-ftpserverid="item.ftpserverid">
            {{item.name}}
          </p>
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
      selectedFtpInfo: {},
      isManualFtpClose: false
    }
  },
  mounted () {
    this.getList()
  },
  created () {
    // console.log('start!')
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'isManualFtpClose') {
        this.isManualFtpClose = data
        if (this.isManualFtpClose) {
          this.getList()
          console.log('slshsh')
        }
      }
      this.selectedFtpId = ''
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
        if (this.selectedFtpInfo) {
          if (Object.keys(response.data.results).length !== 0) {
            for (let idx in this.targetFtpList) {
              let item = this.targetFtpList[idx]
              if (this.selectedFtpInfo.ftpserverid === item.ftpserverid) {
                this.selectedFtp(item)
                break
              }
            }
          }
        }
      })
    },
    manualFtpPopup: function (type) {
      if (type === 'modify' && !this.selectedFtpInfo.ftpserverid) {
        ipcRenderer.send('alert', '편집할 FTP서버를 선택해주세요.')
        return false
      }
      const data = {}
      data.parentKey = this.selfKey
      data.type = type
      if (this.selectedFtpInfo) {
        data.selectedFtpInfo = custom.proxy2map(this.selectedFtpInfo)
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
    deleteManualFtp: function () {
      let ftpInfo = this.selectedFtpInfo
      if (!ftpInfo) {
        ipcRenderer.send('alert', '삭제할 FTP서버를 선택해주세요.')
        return false
      }
      axios.deleteAsyncAxios('/v2/ftpservers/' + ftpInfo.ftpserverid, null, null, (response) => {
        // console.log('delete', response)
        let msg = '선택한 FTP서버가 삭제가 완료되었습니다.'
        ipcRenderer.send('alert', msg)
        this.getList()
      })
    },
    fileUploadPopup: function (ftpInfoItem) {
      this.selectedFtpId = ftpInfoItem.ftpserverid
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
    },
    selectedFtp: function (item) {
      this.selectedFtpInfo = item
    }
  },
  unmounted () {
    ipcRenderer.off('receiveData', this.init)
  }
}
</script>
