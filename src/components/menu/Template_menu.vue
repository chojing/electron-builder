<template>
  <div class="fixed-bar">
    <div class="wrap flex-center">
        <div>
          <Tooltip :tooltipText="'메인'">
            <router-link to="/main" :class="{active : this.$route.name === 'Main'}">
              <i class="fas fa-folder"/>
            </router-link>
          </Tooltip>
        </div>
      <div>
        <Tooltip :tooltipText="'전송내역'">
          <router-link to="/history" :class="{active : this.$route.name === 'History'}">
             <i class="fas fa-upload"/>
           </router-link>
        </Tooltip>
      </div>
      <div>
        <Tooltip :tooltipText="'수신내역'">
          <router-link to="/receivedHistory" :class="{active : this.$route.name === 'ReceivedHistory'}">
            <i class="fas fa-download"/>
          </router-link>
        </Tooltip>
      </div>
      <div>
        <Tooltip :tooltipText="'긴급전송'">
          <router-link to="/emergency" :class="{active : this.$route.name === 'Emergency'}">
            <i class="fas fa-exclamation-triangle"/>
          </router-link>
        </Tooltip>
      </div>
      <div>
        <Tooltip :tooltipText="'설정'">
          <p @click="this.$route.matched[0].name === 'Manual' ? '' : this.$router.push('/manual')"
                       :class="{active : this.$route.matched[0].name === 'Manual'}">
            <i class="fas fa-cog"/>
          </p>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import Tooltip from '@/components/Tooltip'
export default {
  name: 'template_menu',
  components: {
    Tooltip
  }
}

</script>
