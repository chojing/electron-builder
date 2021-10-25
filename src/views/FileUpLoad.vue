<template>
  <section class="file-container pb40">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <h4>전송제목</h4>
      <div class="file-tti-box mb40">
        <input class="input-box" type="text" value="">
      </div>
      <h4>Optional(요청내역)</h4>
      <div class="file-list-box mb20">
        <ul>
          <li>
            요청내역리스트 첫번째
          </li>
          <li>
            요청내역리스트 두번째
          </li>
        </ul>
      </div>
      <h4>파일(폴더) 전송</h4>
      <div class="file-drag-box mb20">
        <div class="drag">

        </div>
      </div>
      <button class="btn blue allSubmit">전송</button>
    </div>
  </section>
</template>

<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
const axios = require('../assets/js/axios.js')

export default {
  name: 'FileUpLoad',
  data () {
  },
  methods: {
  }
}
</script>
