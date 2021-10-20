<template>
  <div class="fixed-bar">
    <div class="wrap flex-center">
      <span>
        <router-link to="/main"> <i class="fas fa-folder"></i></router-link>
      </span>
      <span>
         <router-link to=""> <i class="fas fa-exchange-alt"></i> </router-link>
      </span>
      <span>
          <router-link to=""> <i class="fas fa-exclamation-triangle"></i></router-link>
      </span>
      <span>
          <router-link to=""> <i class="fas fa-file-upload"></i> </router-link>
      </span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'template_menu'
}

</script>
