<template>
  <div class="home-view">
    <ArcadeGame />
  </div>
</template>

<script>
import ArcadeGame from '@/components/ArcadeGame.vue'

export default {
  name: 'HomeView',
  components: {
    ArcadeGame
  }
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
}
</style>
