<template>
  <div>
    <background show={show}></background>
    <Arcade show={show}> </Arcade>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Background from "@/Background.vue";
import Arcade from'./Arcade.vue'

const show = ref(false)
</script>

<style scoped></style>
