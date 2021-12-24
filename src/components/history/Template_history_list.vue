<!-- 전송내역 -->
<template>
  <tr v-for="item in transferList" v-bind:key="item.transferid" @click="historyDetailPopup(item.transfername, item.transferid, item.transfertype_code)">
    <td class="targetName ellipsis">
      <Tooltip :tooltipText="item.transfername" position="top">
        <p>{{item.transfername}}</p>
      </Tooltip>
    </td>
    <td class="ellipsis">
      <Tooltip :tooltipText="item.pathname" position="top">
        <p>{{item.pathname}}</p>
      </Tooltip>
    </td>
    <td class="ellipsis">
      <Tooltip :tooltipText="item.transferendtime+''" position="top">
        <p>{{item.transferendtime}}</p>
      </Tooltip>
    </td>
    <td>
      <div>
        <div class="pro-bar">
          <span :class = "item.status_code" :style="{width:item.dataPer + '%'}"></span>
          <template v-if="item.status >= 2000 && item.status < 3000">
            <b>{{item.dataPer}} %</b>
          </template>
          <template v-else>
            <b>{{item.status_caption}}</b>
          </template>
        </div>
      </div>
    </td>
  </tr>
  <tr v-show="isShow">
    <td colspan="4">조회 결과가 없습니다.</td>
  </tr>
</template>

<script>
import Tooltip from '@/components/Tooltip'
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  components: {
    Tooltip
  },
  props: {
    transferList: Array,
    isShow: Boolean
  },
  data () {
    return {
      g_windowIndex: 0,
      selfKey: 'main'
    }
  },
  methods: {
    init: function (event, key, data) {},
    historyDetailPopup: function (transfername, transferid, transfertype_code) {
      const data = {
        parentKey: this.g_curWindowKey,
        transfername: transfername,
        transferid: transferid,
        transfertype_code: transfertype_code
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'HistoryDetail',
        data: data,
        width: 600,
        height: 700,
        parent: '',
        modal: true
      })
    }
  }
}
</script>
