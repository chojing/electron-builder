<template>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
            <h4>전송 Target</h4>
            <!--modify-->
            <button class="btn h30" @click="manualFtpPopup">관리</button>
          </div>
        </div>
        <div class="target-list" style="background: #f1fbff;">
          <ul class="one-list">
            <li v-for="item in targetFtpList" v-bind:key="item.ftpserferid" @dblclick="this.FileUploadPopup(item)">
              <p>{{item.name}}</p>
            </li>
          </ul>
        </div>
      </article>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateMenu from '@/components/menu/Template_menu'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const axios = require('@/assets/js/axios.js')
const custom = require('@/assets/js/custom.js')
export default {
  name: 'Manual',
  components: {
    templateMenu
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: 'main',
      targetFtpList: [],
      testValue: []
    }
  },
  mounted () {
    this.getList()
  },
  created () {
    console.log('start!')
    // const self = this
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'testType') {
        this.testValue.push(data)
        console.log('담은 데이터', this.testValue)
      }
    },
    getList: function () {
      const param = {}
      const condition = {}
      condition.owner = this.$store.state.userid
      condition.ismanual = 1
      param.condition = condition
      const sort = {}
      sort.createtime = 'desc'
      param.sort = sort
      param.limit = 0
      param.offset = 0
      axios.getAsyncAxios('/v2/ftpservers', param, (response) => {
        console.log(response)
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
    FileUploadPopup: function (ftpInfoItem) {
      const item = custom.proxy2map(ftpInfoItem)
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'ManualFileUpload',
        data: item,
        width: 700,
        height: 700,
        parent: '',
        modal: false
      })
      console.log(ftpInfoItem)
    }
  }
}
</script>
