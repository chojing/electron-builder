<template>
  <section class="file-container pb40 pt20">
    <div class="wrap">
      <div class="user-favorite">
        <div class="favorite-list mb20">
          <div class="file-item fa-item flex-column">
            <button><span>{{targetNameValue}}</span></button>
          </div>
        </div>
      </div>
      <Template_file v-bind:isTelUse="isTelUse" :isSite="isSite"/>
    </div>
  </section>
</template>

<script>
import Template_file from '@/components/fileUpload/Template_file'
const { ipcRenderer } = require('@/assets/js/include.js')

export default {
  name: 'FileUpLoad',
  components: {
    Template_file
  },
  data () {
    return {
      g_windowIndex: 0,
      targetNameValue: '',
      isTelUse: true,
      isSite: this.init()
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    // type에 따라 값 전달
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.targetNameValue = data.pathname
        this.isSite = data.isSite
      }
    }
  }
}
</script>
