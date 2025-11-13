<template>
  <div class="main-screen">
    <div class="user-card pixel-border">
      <div class="user-header">
        <div class="user-avatar" :style="{ backgroundColor: user.color }">
          {{ user.pseudo.substring(0, 2).toUpperCase() }}
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user.pseudo }}</h2>
          <p class="user-email">{{ user.email }}</p>
          <p class="user-stats">Member since: {{ formatDate(user.createdAt) }}</p>
        </div>
      </div>

      <div class="user-actions">
        <button @click="$emit('start-game')" class="pixel-button start-game-btn">
          🎮 START GAME
        </button>

        <div class="secondary-actions">
          <button @click="$emit('show-stats')" class="pixel-button-small">
            📊 STATS
          </button>
          <button @click="$emit('show-settings')" class="pixel-button-small">
            ⚙️ SETTINGS
          </button>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="$emit('logout')" class="back-button pixel-button-small">
        ← LOGOUT
      </button>
    </div>

    <div class="recent-games pixel-border">
      <h3>RECENT GAMES</h3>
      <div class="no-games">
        No games played yet. Start your first game!
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainScreen',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  emits: ['start-game', 'show-stats', 'show-settings', 'logout'],
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.main-screen {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  margin-bottom: 30px;
}

.user-header {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  align-items: center;
}

.user-avatar {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border: 4px solid #000;
  box-shadow:
    inset 0 0 0 4px rgba(255, 255, 255, 0.3),
    -4px 4px 0 rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #FFE66D;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5);
}

.user-email {
  font-size: 0.7rem;
  color: #95E1D3;
  margin-bottom: 10px;
}

.user-stats {
  font-size: 0.6rem;
  color: #95E1D3;
  opacity: 0.7;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.start-game-btn {
  font-size: 1.3rem;
  padding: 25px;
  background: #4ECDC4;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.start-game-btn:hover {
  background: #45b8b0;
}

.secondary-actions {
  display: flex;
  gap: 15px;
  justify-content: space-between;
}

.recent-games {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  padding: 30px;
  max-width: 600px;
  width: 100%;
  margin-top: 20px;
}

.recent-games h3 {
  font-size: 1rem;
  margin-bottom: 20px;
  text-align: center;
  color: #FFE66D;
}

.no-games {
  text-align: center;
  font-size: 0.7rem;
  color: #95E1D3;
  padding: 20px;
  opacity: 0.7;
}

.controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 20px;
}

.back-button {
  background: #F38181;
}

.back-button:hover {
  background: #e57373;
}

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
  }

  .user-name {
    font-size: 1.2rem;
  }

  .secondary-actions {
    flex-direction: column;
  }
}
</style>
