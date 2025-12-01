<template>
  <div class="game-view">
    <div v-if="loading" class="loading">LOADING...</div>

    <div v-else class="game-container pixel-border">
      <div class="game-header">
        <h2>{{ gameTitle }}</h2>
        <div class="player-info" v-if="user">
          PLAYER: <span :style="{ color: user.color }">{{ user.pseudo }}</span>
        </div>
      </div>

      <div class="game-content">
        <component
          :is="currentGameComponent"
          :controls="currentControls"
          @game-over="handleGameOver"
        />
      </div>

      <div class="game-controls">
        <button @click="goBack" class="pixel-button-small back-btn">
          EXIT GAME
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api.js'
import SnakeGame from '@/components/games/SnakeGame.vue'
import TetrisGame from '@/components/games/TetrisGame.vue'
import SpaceDefender from '@/components/games/SpaceDefender.vue'
import PongGame from '@/components/games/PongGame.vue'

export default {
  name: 'GameView',
  props: ['gameId'],
  components: { SnakeGame, TetrisGame, SpaceDefender, PongGame },
  data() {
    return {
      user: null,
      loading: true,
      currentSessionId: null,
      startTime: null,
      currentControls: 'arrows' // Par défaut
    }
  },
  computed: {
    currentGameComponent() {
      const map = { 'snake': 'SnakeGame', 'tetris': 'TetrisGame', 'space': 'SpaceDefender', 'pong': 'PongGame' }
      return map[this.gameId] || 'SnakeGame'
    },
    gameTitle() {
      const map = { 'snake': 'NEON SNAKE', 'tetris': 'BLOCK MASTER', 'space': 'SPACE DEFENDER', 'pong': 'CYBER PONG' }
      return map[this.gameId] || 'ARCADE'
    }
  },
  async mounted() {
    // 1. Récupérer les settings depuis le localStorage
    const savedSettings = localStorage.getItem('arcade_settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      if (parsed.controls) this.currentControls = parsed.controls
    }

    // 2. Démarrer la session
    try {
      const response = await api.getProfile()
      if (response.user) {
        this.user = response.user
        const session = await api.startGame()
        this.currentSessionId = session.sessionId
        this.startTime = Date.now()
      } else {
        this.goBack()
      }
    } catch (e) {
      this.goBack()
    } finally {
      this.loading = false
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    },
    async handleGameOver(score) {
      if (this.currentSessionId) {
        try {
          // Calculer la durée en secondes
          const duration = Math.floor((Date.now() - this.startTime) / 1000)

          // Envoyer au backend avec les bons paramètres
          await api.updateScore(this.currentSessionId, score, duration)

          alert(`Game Over! Score: ${score} points saved!`)

          // Optionnel : Retour au menu après validation
          // this.goBack()
        } catch (e) {
          console.error('Score save error', e)
          alert('Error saving score!')
        }
      }
    }
  }
}
</script>

<style scoped>
.game-view { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
.game-container { background: rgba(22, 33, 62, 0.95); padding: 30px; max-width: 800px; width: 100%; color: white; box-shadow: 0 0 50px rgba(0,0,0,0.8); }
.game-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid white; padding-bottom: 20px; margin-bottom: 30px; }
.game-header h2 { color: #FFE66D; text-shadow: 3px 3px 0 rgba(0,0,0,0.5); font-size: 1.2rem; }
.game-content { display: flex; justify-content: center; margin-bottom: 30px; }
.game-controls { display: flex; justify-content: center; }
.back-btn { background: #FF6B6B; }
.back-btn:hover { background: #ff5252; }
.loading { color: white; font-size: 2rem; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: 0; } }
</style>