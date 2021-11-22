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
const { ipcRenderer, axios, custom } = require('@/assets/js/include.js')
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
      axios.getAsyncAxios('/v2/node/code', {}, (response) => {
        this.c_node_type = response.data.c_node_type
        let param = {}
        param.nodetype = custom.code.codeToValue(this.c_node_type, 'emergency')
        axios.getAsyncAxios('/v2/nodes', param, (response) => {
          axios.getAsyncAxios('/v2/nodes/' + response.data.results[0].nodeid, null, (response) => {
            this.targetFtpList = response.data.results
          })
        })
      })
    },
    FileUploadPopup: function (ftpInfoItem) {
      const item = custom.proxy2map(ftpInfoItem)
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'EmergencyFileUpLoad',
        data: item,
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
