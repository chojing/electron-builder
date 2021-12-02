<!-- 수신내역 -->
<template>
  <tr v-for="item in receivedDetailList" v-bind:key="item.fileid">
    <td class="ellipsis">
      <Tooltip :tooltipText="item.ftpservername" position="top">
        <p>{{item.ftpservername}}</p>
      </Tooltip>
    </td>
    <td @click="fileopen(item)" class="filePath ellipsis">
      <Tooltip :tooltipText="item.filepath" position="top">
        <p>
        {{item.filepath}}
        </p>
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
  <tr v-show="isShow">
    <td colspan="4">조회 결과가 없습니다.</td>
  </tr>
</template>

<script>
import Tooltip from '@/components/Tooltip'
const { ipcRenderer } = require('@/assets/js/include.js')
export default {
  emits: ['selectftpserverinfo'],
  components: {
    Tooltip
  },
  props: {
    receivedDetailList: Array,
    isShow: Boolean
  },
  methods: {
    fileopen: function (item) {
      // console.log('gIsMac : ', item.gIsMac, ' Volume : ', item.volume, ' filepath : ', item.filepath)
      let path = item.volume + item.filepath
      // console.log('path : ', path)
      this.$emit('selectftpserverinfo', item)
      ipcRenderer.send('open-file-explore', path)
    }
  }
}
</script>
