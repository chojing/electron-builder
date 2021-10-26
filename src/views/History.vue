<template>
  <div class="backBtn" @click="$router.go(-1)"><i class="fas fa-arrow-left"></i></div>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb40">전송내역</h4>
      <div class="send-box">
        <table>
          <thead>
          <tr>
            <th>Target</th>
            <th>전송명</th>
            <th>파일명</th>
            <th>상태</th>
          </tr>
          </thead>
          <tbody>
            <templateHistory/>
          </tbody>
        </table>
      </div>
      <button type="button" id="cancel" class="btn h40 m-auto">확인</button>
    </div>
  </section>
</template>

<script>
import templateHistory from '@/components/history/Template_history_list'

export default {
  components: {
    templateHistory
  }
}
</script>
