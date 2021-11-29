<!-- 전송내역 -->
<template>
  <tr v-for="item in ftpResultData" v-bind:key="item.ftpserverid">
      <td>{{item.ftpserverid}}</td>
      <td>{{item.fileName}}</td>
    <td>
      <div>
          <div class="pro-bar">
            <span :style="{width:item.dataPer + '%'}"></span>
            <b>{{item.dataPer}} %</b>
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
export default {
  props: {
    ftpResultData: Object
  },
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>
