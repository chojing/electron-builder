<template>
  <main style="padding-top: 0;">
    <div class="wrap">
      <h4 class="tti">긴급전송</h4>
      <div class="emergency-list">
        <ul>
          <li>

          </li>
        </ul>
      </div>
    </div>
  </main>
  <templateMenu/>
</template>
<script>
import templateMenu from '@/components/menu/Template_menu'
// eslint-disable-next-line no-unused-vars
const axios = require('@/assets/js/axios.js')

export default {
  name: 'Emergency',
  components: {
    templateMenu
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>
