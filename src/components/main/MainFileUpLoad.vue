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
      <Template_file/>
    </div>
  </section>
</template>

<script>
import Template_file from '@/components/fileUpload/Template_file'
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

export default {
  name: 'FileUpLoad',
  components: {
    Template_file
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: '',
      targetNameValue: '',
      fileList: [],
      isTelUse: true
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    // type에 따라 값 전달
    init: function (event, key, data, type) {
      if (type == 'init') {
        this.targetNameValue = data.value
      }
    }
  }
}
</script>
