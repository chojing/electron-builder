<template>
  <section class="history-container">
    <div class="wrap">
      <h4 class="tti mb40">수신내역</h4>
      <select>
        <option> 기본값 </option>
      </select>
      <div class="send-box">
        <table>
          <colgroup>
            <col width="30%">
            <col width="25%">
            <col width="25%">
            <col width="20%">
          </colgroup>
          <thead>
          <tr>
            <th>Target</th>
            <th>전송명</th>
            <th>파일명</th>
            <th>상태</th>
          </tr>
          </thead>
          <tbody>
            <templateReceivedHistory/>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <templateMenu/>
</template>

<script>
import templateReceivedHistory from '@/components/receivedHistory/Template_history_list'
import templateMenu from '@/components/menu/Template_menu'
export default {
  components: {
    templateReceivedHistory,
    templateMenu
  }
}
</script>
