<!-- 수신내역 리스트-->
<template>
  <tr v-for="item in receivedList" v-bind:key="item.transferid" :data-transferid="item.transferid"
      @click="receivedHistoryDetailPopup(item.transfername, item.transferid)"
      @contextmenu.prevent="showContextMenu($event)">
    <td class="ellipsis">
      <Tooltip :tooltipText="item.userid_realname" position="top">
        <p>{{item.userid_realname}}</p>
      </Tooltip>
    </td>
    <td class="targetName ellipsis">
      <Tooltip :tooltipText="item.transfername" position="top">
        <p>
          {{item.transfername}}
        </p>
      </Tooltip>
    </td>
    <td class="ellipsis">
      <Tooltip :tooltipText="item.pathname" position="top">
        <p>{{item.pathname}}</p>
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
    receivedList: Array,
    isShow: Boolean
  },
  data () {
    return {
      g_curWindowKey: 0,
      selfKey: 'main'
    }
  },
  methods: {
    init: function (event, key, data) {},
    showContextMenu: function (e) {
      this.$parent.showContextMenu(e)
    },
    receivedHistoryDetailPopup: function (transfername, transferid) {
      this.$parent.hideContextMenu()
      const data = {
        parentKey: this.g_curWindowKey,
        transfername: transfername,
        transferid: transferid
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'ReceivedHistoryDetail',
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
