<template>
  <div>
    <h1>App</h1>
    <button @click="show = !show">
      {{ show ? 'Fermer' : 'Ouvrir' }} Background
    </button>

    <Background v-if="show" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Background from'./Background.vue'

const show = ref(false)
</script>

<style scoped></style>
