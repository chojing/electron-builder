<template>
  <section class="file-container pb40">
    <div class="wrap">
      <h4 class="tti mb20">사용자 FTP</h4>
      <Template_file v-bind:isTelUse="isTelUse" :isSite="isSite"/>
    </div>
  </section>
</template>

<script>
import Template_file from '@/components/fileUpload/Template_file'
export default {
  data () {
    return {
      isTelUse: false,
      isSite: false
    }
  },
  components: {
    Template_file
  }
}
</script>
