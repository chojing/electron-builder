<!-- 전송내역 -->
<template>
  <tr v-for="item in transferDetailList" v-bind:key="item.fileid">
    <td>
      <Tooltip :tooltipText="item.ftpservername" position="top">
        <p class="ellipsis-w">
        {{item.ftpservername}}
        </p>
      </Tooltip>
    </td>
    <td>
      <Tooltip :tooltipText="item.filepath" position="top">
        <p class="ellipsis-w140">
        {{item.filepath}}
        </p>
      </Tooltip>
    </td>
    <td>
      <Tooltip :tooltipText="item.filename" position="top">
        <p class="ellipsis-w">
        {{item.filename}}
        </p>
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
    transferDetailList: Array,
    isShow: Boolean
  }
}
</script>
