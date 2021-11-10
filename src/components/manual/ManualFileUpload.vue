<template>
  <section class="file-container pb40">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <Template_file v-bind:isTelUse="isTelUse"/>
    </div>
  </section>
</template>

<script>
import Template_file from '@/components/fileUpload/Template_file'
export default {
  data () {
    return {
      isTelUse: true
    }
  },
  components: {
    Template_file
  }
}
</script>
