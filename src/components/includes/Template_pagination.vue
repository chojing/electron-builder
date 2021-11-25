<template>
  <ul v-if="pageData.list.length">
    <template v-if="pageData.currentPage === 1">
      <li><i class="fa fa-angle-double-left" aria-hidden="true"></i></li>
    </template>
    <template v-else>
      <li @click="sendPage(1)"><i class="fa fa-angle-double-left" aria-hidden="true"></i></li>
    </template>
    <li @click="pageData.prev !== null ? sendPage(pageData.prev) : ''">
      <i class="fa fa-angle-left" aria-hidden="true"></i>
    </li>
    <li :class="{ active: page === pageData.currentPage }"
        v-for="page in pageData.list" :key="page"
        @click="sendPage(page)">
      {{ page }}
    </li>
    <li @click="pageData.next !== null ? sendPage(pageData.next) : ''">
      <i class="fa fa-angle-right" aria-hidden="true"></i>
    </li>
    <template v-if="pageData.currentPage === pageData.totalPage">
      <li><i class="fa fa-angle-double-right" aria-hidden="true"></i></li>
    </template>
    <template v-else>
      <li @click="sendPage(pageData.totalPage)"><i class="fa fa-angle-double-right" aria-hidden="true"></i></li>
    </template>
  </ul>
</template>

<script>
export default {
  name: 'Template_pagination',
  props: ['pageData'],
  methods: {
    sendPage (page) {
      this.$emit('paging', page)
    }
  }
}
</script>
