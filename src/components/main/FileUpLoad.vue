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
      <!-- @valueReturn : 자식 컴포넌트에서 emit 의 이벤트명 / "setInput" : 부모(여기)컴포넌트에서 function에 등록할 함수명 -->
      <baseDragDrop @valueReturn="DragDropResult"/>
      <div class="file-submit-box">
        <div class="box flex-box">
          <input :value="this.testValue" class="input-box flex-1" type="text" placeholder="전송 확인 문자 연락처(다중)">
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
      selfKey: '',
      targetNameValue: '',
      fileList: [],
      testValue: []
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
        this.selfKey = key
      } else if (type == 'userTelData') {
        console.log('넘겨받은 데이터', data)
        this.testValue.push(data)
        console.log('담은 데이터', this.testValue)
      }
    },
    userInfoPopup: function () {
      const data = {
        parentKey: this.selfKey
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
