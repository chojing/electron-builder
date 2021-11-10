<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb40">수신내역</h4>
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
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateHistory from '@/components/history/Template_history_list'
import templateMenu from '@/components/menu/Template_menu'
export default {
  components: {
    templateHistory,
    templateMenu
  }
}
</script>
