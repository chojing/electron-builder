<!-- 수신내역 -->
<template>
  <tr v-for="item in receivedDetailList" v-bind:key="item.fileid">
    <td>
      <Tooltip :tooltipText="item.ftpservername" position="top">
        {{item.ftpservername}}
      </Tooltip>
    </td>
    <td>
      <Tooltip :tooltipText="item.filepath" position="top">
        {{item.filepath}}
      </Tooltip>
    </td>
    <td>
      <Tooltip :tooltipText="item.filename" position="top">
        {{item.filename}}
      </Tooltip>
    </td>
    <td>{{item.filesize}}</td>
  </tr>
  <tr v-show="isShow">
    <td colspan="4">조회 결과가 없습니다.</td>
  </tr>
</template>

<script>
import Tooltip from '@/components/Tooltip'
export default {
  components: {
    Tooltip
  },
  props: {
    receivedDetailList: Array,
    isShow: Boolean
  }
}
</script>
