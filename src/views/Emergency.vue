<template>
  <section class="emergency-container">
    <div class="wrap">
      <h4 class="tti">긴급전송</h4>
      <article class="mt20">
        <div class="search-form">
            <h4>전송 Target</h4>
        </div>
        <div class="target-list" style="background: #f5f5f5;border-radius: 5px;">
          <ul class="one-list">
            <!-- 수동FTP리스트 임시값 적용 // 추후에 맞는 값으로 변경해야함-->
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
  name: 'Emergency',
  components: {
    templateMenu
  },
  data () {
    return {
      g_windowIndex: 0,
      targetFtpList: []
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
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
    FileUploadPopup: function (ftpInfoItem) {
      const item = custom.proxy2map(ftpInfoItem)
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'EmergencyFileUpLoad',
        data: item,
        width: 600,
        height: 700,
        parent: '',
        modal: false
      })
      console.log(ftpInfoItem)
    }
  }
}
</script>
