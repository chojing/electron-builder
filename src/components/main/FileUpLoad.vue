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
        <textarea></textarea>
      </div>
<!-- @valueReturn : 자식 컴포넌트에서 emit 의 이벤트명 / "setInput" : 부모(여기)컴포넌트에서 function에 등록할 함수명 -->
<baseDragDrop @valueReturn="DragDropResult"/>

      <div class="file-submit-box flex-box">
        <div class="box flex-1">
          <input class="input-box" type="text" placeholder="전송 확인 문자 연락처(다중)">
          <button @dblclick="userInfoPopup" id="user-info-btn"><i class="fas fa-phone-square-alt"></i></button>
        </div>
      </div>
      <button class="btn blue allSubmit">전송</button>
    </div>
  </section>
</template>

<script>
import baseDragDrop from '@/components/main/BaseDragDrop'

const electron = window.require('electron')
const ipcRenderer = electron.ipcRenderer

export default {
  name: 'FileUpLoad',
  components: {
    baseDragDrop
  },
  data () {
    return {
      g_windowIndex: 0,
      targetNameValue: '',
      fileList: [],
      testValue: {}
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
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
        modal: true
      })
    },
    DragDropResult: function (value) {
      this.fileList = value
      console.log(value)
    }
  }
}
</script>
