<template>
  <section class="file-container">
    <div class="wrap">
      <h4 class="tti">수동 FTP</h4>
      <article class="mt20">
        <div class="search-form">
          <div class="flex-center">
            <h4>전송 Target</h4>
            <!--modify-->
            <button type="button" id="manual-btn" class="btn h30">등록</button>
          </div>
        </div>
        <div class="target-list">
          <ul class="one-list"></ul>
        </div>
      </article>
    </div>
  </section>

  <templateMenu/>

</template>

<script>
import templateMenu from '@/components/menu/template_menu'

export default {
  name: 'Manual',
  components: {
    templateMenu
  },
  data () {
    return {
    }
  }
}
</script>
