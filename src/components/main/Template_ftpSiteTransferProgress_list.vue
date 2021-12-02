<!-- 전송내역 -->
<template>
  <tr v-for="item in ftpResultData" v-bind:key="item.ftpserverid">
      <td><p class="ellipsis-w">{{item.ftpservername}}</p></td>
      <td><p class="ellipsis-w160">{{item.fileName}}</p></td>
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
