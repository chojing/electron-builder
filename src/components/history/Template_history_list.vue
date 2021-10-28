<template>
  <tr>
    <td class="targetName">name</td>
    <td>/root</td>
    <td>test.mp4</td>
    <td>
      <div>
        <div class="pro-bar">
          <span :style="{width: dataPer + '%'}"></span>
          <b>{{ dataPer }}%</b>
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
export default {
  data () {
    return {
      dataPer: 50
    }
  }
}
</script>
