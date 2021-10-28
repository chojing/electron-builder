<template>
  <section class="file-container pb40">
    <div class="wrap">
      <div class="user-favorite">
        <div class="favorite-list mb20">
          <div class="file-item fa-item flex-column">
            <button><span>{{targetNameValue}}</span></button>
          </div>
        </div>
      </div>
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
      <div class="file-submit-box flex-box">
        <div class="box flex-1">
          <input class="input-box" type="text" placeholder="전송 확인 문자 연락처(다중)">
          <button @click="userInfoPopup" id="user-info-btn"><i class="fas fa-phone-square-alt"></i></button>
        </div>
      </div>
      <button class="btn blue allSubmit">전송</button>
    </div>
  </section>
</template>

<script>
const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer
export default {
  name: 'FileUpLoad',
  data () {
    return {
      g_windowIndex: 0,
      targetNameValue: ''
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
    // ipcRenderer.on('receiveData', function (event, key, data) {
    //   this.targetNameValue = data.value
    //   console.log('event : ', event)
    //   console.log('key : ', key)
    //   console.log('data : ', data.value)
    //   console.log('Adata : ', this.targetNameValue)
    // })
  },
  methods: {
    init: function (event, key, data) {
      this.targetNameValue = data.value
    },
    userInfoPopup: function () {
      const data = {
        value: ''
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'UserInfo',
        data: data,
        width: 500,
        height: 500,
        parent: '',
        modal: false
      })
      console.log('data send : ', data)
    }
  }
}
</script>
