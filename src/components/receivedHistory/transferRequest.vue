<template>
  <section class="userPwModify">
    <h2>전송요청내역</h2>
    <div class="transfer-request mt20">
      <p>{{transferRequest}}</p>
    </div>
    <div class="center mt10">
      <button @click="close" type="button" class="btn blue h30">닫기</button>
    </div>
  </section>
</template>

<script>
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  name: 'TransferRequest',
  data () {
    return {
      g_curWindowKey: '',
      parentKey: '',
      transferRequest: ''
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  mounted () {
  },
  methods: {
    init: function (event, key, data, type) {
      console.log('data: ', data)
      if (type == 'init') {
        this.parentKey = data.parentKey
        this.g_curWindowKey = key
        this.transferRequest = data.transferRequest
        // console.log('data.transferRequest : ', data.transferRequest)
      }
    },
    close: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    }
  }
}
</script>
