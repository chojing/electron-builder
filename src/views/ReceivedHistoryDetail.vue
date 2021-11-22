<template>
  <section class="history-detaile-container">
    <div class="wrap">
      <h4 class="tti">수신내역 상세</h4>
      <p class="targetName mt20">
        {{ ftpName }}
      </p>
      <div class="send-box">
        <table>
          <thead>
          <tr>
            <th>사이트</th>
            <th>서버</th>
            <th>파일명</th>
            <th>상태</th>
          </tr>
          </thead>
          <tbody>
            <templateReceivedDetailHistory />
          </tbody>
        </table>
      </div>
      <button @click="cancel" type="button" id="cancel" class="btn h40 m-auto">확인</button>
    </div>
  </section>

</template>

<script>
import templateReceivedDetailHistory from '@/components/receivedHistory/Template_history_detail_list'
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  data () {
    return {
      g_windowIndex: 0,
      ftpName: ''
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  components: {
    templateReceivedDetailHistory
  },
  methods: {
    init: function (event, key, data) {
      // eslint-disable-next-line camelcase
      this.ftpName = data.value
      this.g_curWindowKey = key
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    }
  }
}
</script>
