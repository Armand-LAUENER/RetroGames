<template>
  <div class="start-screen">
    <h1 class="arcade-title">
      <span class="glitch">Retro Games</span>
      <span class="subtitle">Arcade</span>
    </h1>
    <button @click="$emit('start')" class="start-button pixel-button">
      START
    </button>
    <div class="insert-coin">INSERT COIN</div>
  </div>
</template>

<script>
/**
 * StartScreen Component
 * * Displays the initial landing screen of the arcade application.
 * Features a retro-style glitch effect title and a start button to initiate the flow.
 */
export default {
  name: 'StartScreen',
  emits: ['start']
}
</script>

<style scoped>
.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.arcade-title {
  text-align: center;
  margin-bottom: 60px;
  animation: float 3s ease-in-out infinite;
}

.glitch {
  font-size: 4rem;
  display: block;
  text-shadow:
    3px 3px 0 #ff00de,
    -3px -3px 0 #00fff9;
  animation: glitch 1s infinite;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
}

.subtitle {
  font-size: 2rem;
  display: block;
  margin-top: 50px;
  color: #FFE66D;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.start-button {
  width: 100%;
  max-width: 250px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.insert-coin {
  position: absolute;
  bottom: 40px;
  font-size: 0.8rem;
  animation: blink 1s step-start infinite;
  color: #FFE66D;
}

@keyframes blink {
  50% { opacity: 0; }
}

@media (max-width: 768px) {
  .glitch {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.5rem;
  }
}
</style>