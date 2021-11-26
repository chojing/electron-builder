<!-- 전송내역 -->
<template>
  <tr v-for="item in ftpResultData" v-bind:key="item.ftpserverid">
      <td>{{item.ftpserverid}}</td>
      <td>{{item.fileName}}</td>
    <td>
      <div>
          <div class="pro-bar">
          <template v-if="!ftpResultData.isComplete">
            <span class="pro-bar" :style="{width:item.dataPer + '%'}"></span>
          </template>
          <template v-else>
            <span class="pro-bar" :style="{width:'100%'}"></span>
          </template>
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
