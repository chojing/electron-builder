<template>
  <section class="file-container pb40">
    <div class="wrap">
      <h4 class="tti mb20">긴급전송 FTP</h4>
      <Template_file v-bind:isTelUse="isTelUse" :isSite="isSite"/>
    </div>
  </section>
</template>

<script>
import Template_file from '@/components/fileUpload/Template_file'
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  components: {
    Template_file
  },
  data () {
    return {
      isTelUse: false,
      isSite: this.init()
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.isSite = data.isSite
      }
    }
  }
}
</script>
