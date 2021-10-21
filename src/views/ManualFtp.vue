<template>
  <div class="backBtn" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
  <section class="manual-ftp-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <div class="ftp-info mt20">
        <div class="btn-box right">
          <button @click="terms = false" class="btn h30">등록</button>
          <button @click="terms = !terms" :aria-pressed="terms ? 'true' : 'false'" id="modify-btn" class="btn blue h30">수정</button>
        </div>
        <select name="" id="selectFtp">
          <option value="FTP정보1">FTP정보1</option>
          <option value="FTP정보2">FTP정보2</option>
          <option value="FTP정보3">FTP정보3</option>
          <option value="FTP정보4">FTP정보4</option>
        </select>
        <div class="list flex-center">
          <b>이름</b>
          <div class="flex-1">
            <input type="text" class="input-box name" value="홍길동" :disabled='isDisabled'>
          </div>
        </div>
        <div class="list flex-center">
          <b>HOST</b>
          <div class="flex-1">
            <input type="text" class="input-box" value="hostText" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>PORT</b>
          <div class="flex-1">
            <input type="text" class="input-box" value="portText" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>ID</b>
          <div class="flex-1">
            <input type="text" class="input-box" value="idText" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>PW</b>
          <div class="flex-1">
            <input type="text" class="input-box" value="pwText" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>DIR</b>
          <div class="flex-1">
            <input type="text" class="input-box" value="dirText" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center">
          <b>Proxy</b>
          <div class="flex-1">
            <input type="text" class="input-box" value="proxyText" :disabled='isDisabled' >
          </div>
        </div>
        <div class="list flex-center mode">
          <b>MODE</b>
          <div class="flex-1">
            <div class="radio-input">
              <input type="radio" name="mode" id="basicVal" checked>
              <label for="basicVal">기본</label>
            </div>
            <div class="radio-input">
              <input type="radio" name="mode" id="activeVal" :disabled='isDisabled' >
              <label for="activeVal">능동형</label>
            </div>
            <div class="radio-input">
              <input type="radio" name="mode" id="passiveVal" :disabled='isDisabled' >
              <label for="passiveVal">수동형</label>
            </div>
          </div>
        </div>
      </div>
      <div class="pt20">
        <button id="cancel" class="btn h30 m-auto">확인</button>
      </div>
    </div>
  </section>

  <templateMenu/>

</template>

<script>

export default {
  data () {
    return {
      terms: false
    }
  },
  computed: {
    isDisabled: function () {
      return !this.terms
    }
  }
}
</script>
