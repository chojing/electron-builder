<!-- 전송내역 -->
<template>
  <tr v-for="item in transferDetailList" v-bind:key="item.fileid">
    <td class="ellipsis">
      <Tooltip :tooltipText="item.ftpservername" position="top">
        <p>{{item.ftpservername}}</p>
      </Tooltip>
    </td>
    <td class="ellipsis">
      <Tooltip :tooltipText="item.filepath" position="top">
        <p>{{item.filepath}}</p>
      </Tooltip>
    </td>
    <td class="ellipsis">
      <Tooltip :tooltipText="item.filename" position="top">
        <p>
        {{item.filename}}
        </p>
      </Tooltip>
    </td>
    <td class="ellipsis">
      <Tooltip :tooltipText="item.filesize" position="top">
      <p>
        {{item.filesize}}
      </p>
      </Tooltip>
    </td>
  </tr>
  <tr v-show="isShow" class="no-result">
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
