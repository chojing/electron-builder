<!-- 전송내역 -->
<template>
  <tr v-for="item in ftpResultData" v-bind:key="item.ftpserverid">
    <td class="ellipsis">
      <Tooltip :tooltipText="item.ftpservername" position="top">
        <p>{{item.ftpservername}}</p>
      </Tooltip>
    </td>
    <td class="ellipsis">
      <Tooltip :tooltipText="item.fileName" position="top">
        <p>{{item.fileName}}</p>
      </Tooltip>
    </td>
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
import Tooltip from '@/components/Tooltip'
export default {
  components: {
    Tooltip
  },
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
