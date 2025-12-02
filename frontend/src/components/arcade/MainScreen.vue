<template>
  <div class="main-screen">

    <header class="hub-header">
      <div class="player-badge pixel-border">
        <div class="avatar-mini" :style="{ backgroundColor: user.color }">
          {{ user.pseudo.substring(0, 2).toUpperCase() }}
        </div>
        <div class="player-details">
          <span class="pseudo">{{ user.pseudo }}</span>
          <span class="score">🏆 {{ formatScore(user.highScore) }} PTS</span>
        </div>
      </div>

      <div class="header-actions">
        <button @click="$emit('show-stats')" class="icon-btn" title="Global Ranking">📊</button>
        <button @click="$emit('show-settings')" class="icon-btn" title="Settings">⚙️</button>
        <button @click="$emit('logout')" class="logout-btn pixel-button-small">EXIT ✕</button>
      </div>
    </header>

    <div class="arcade-hub">

      <div class="game-wheel-container pixel-border">
        <div class="wheel-title">SELECT GAME</div>
        <div class="game-wheel" ref="wheel">
          <div
            v-for="(game, index) in games"
            :key="game.id"
            class="game-item pixel-border"
            :class="{ active: selectedGameId === game.id }"
            @click="selectGame(game.id)"
            :ref="'gameItem-' + index"
          >
            <div class="game-icon">{{ game.icon }}</div>
            <div class="game-label">{{ game.title }}</div>
            <div class="selection-arrow" v-if="selectedGameId === game.id">◄</div>
          </div>
        </div>
      </div>

      <div class="game-preview-container pixel-border">
        <div class="preview-header">
          <h2 class="preview-title" :style="{ color: selectedGame.color }">
            {{ selectedGame.title }}
          </h2>
          <span class="genre-tag">{{ selectedGame.genre }}</span>
        </div>

        <div class="preview-content">
          <div class="media-box" :style="{ borderColor: selectedGame.color }">
            <video
              v-if="selectedGame.video"
              :src="selectedGame.video"
              :key="selectedGame.id"
              autoplay
              loop
              muted
              playsinline
              class="game-video"
            ></video>

            <div v-else class="media-placeholder">
              <span class="big-icon">{{ selectedGame.icon }}</span>
              <p>PREVIEW</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="game-info">
              <div class="description pixel-text">{{ selectedGame.description }}</div>
              <div class="controls-box">
                <h4>CONTROLS</h4>
                <div class="control-row" v-for="(action, key) in selectedGame.controls" :key="key">
                  <span class="key-badge">{{ key }}</span>
                  <span class="action-text">{{ action }}</span>
                </div>
              </div>
            </div>

            <div class="game-leaderboard">
              <h4>{{ selectedGame.title }} TOP 5</h4>

              <div v-if="loadingLeaderboard" class="loading-text">Loading...</div>
              <div v-else-if="leaderboardData.length === 0" class="no-scores">
                No scores yet. Play now!
              </div>

              <ul v-else class="leaderboard-list">
                <li v-for="(player, index) in topPlayers" :key="index">
                  <span class="rank" :class="getRankClass(index)">#{{ index + 1 }}</span>
                  <span class="name" :style="{ color: player.color }">{{ player.pseudo }}</span>
                  <span class="points">{{ formatScore(player.highScore) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="play-action">
          <button
            @click="handlePlay"
            class="pixel-button play-btn"
            :style="{ backgroundColor: selectedGame.color }"
          >
            INSERT COIN & PLAY
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'MainScreen',
  props: {
    user: { type: Object, required: true },
    settings: { type: Object, default: () => ({ controls: 'arrows' }) }
  },
  emits: ['start-game', 'show-stats', 'show-settings', 'logout', 'open-new-page'],
  data() {
    return {
      selectedGameId: 'snake',
      loadingLeaderboard: false,
      leaderboardData: [],
      games: [
        {
          id: 'snake', title: 'NEON SNAKE', genre: 'Arcade', icon: '🐍',
          color: '#4ECDC4', description: 'Eat pixels, grow longer!',
          video: '/videos/snake.mp4',
          controls: { 'ARROWS': 'Move', 'SPACE': 'Boost' }
        },
        {
          id: 'tetris', title: 'BLOCK MASTER', genre: 'Puzzle', icon: '🧱',
          color: '#FFE66D', description: 'Stack blocks, clear lines.',
          video: '/videos/tetris.mp4',
          controls: { '↑': 'Rotate', '← →': 'Move', '↓': 'Drop' }
        },
        {
          id: 'space', title: 'SPACE DEFENDER', genre: 'Shooter', icon: '🚀',
          color: '#FF6B6B', description: 'Defend earth against aliens.',
          video: '/videos/space.mp4',
          controls: { '← →': 'Move', 'SPACE': 'Shoot' }
        },
        {
          id: 'pong', title: 'CYBER PONG', genre: 'Sports', icon: '🏓',
          color: '#AA96DA', description: 'Defeat the AI in tennis.',
          video: '/videos/pong.mp4',
          controls: { 'W / S': 'Up / Down' }
        }
      ]
    }
  },
  computed: {
    selectedGame() { return this.games.find(g => g.id === this.selectedGameId) || this.games[0] },
    topPlayers() { return this.leaderboardData.slice(0, 5) }
  },
  async mounted() {
    await this.selectGame(this.selectedGameId)
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown)
  },
  methods: {
    formatScore(val) { return (val || 0).toLocaleString('en-US') },
    getRankClass(i) { if(i===0)return 'gold'; if(i===1)return 'silver'; if(i===2)return 'bronze'; return '' },
    async selectGame(id) {
      this.selectedGameId = id
      this.loadingLeaderboard = true
      this.leaderboardData = []
      try {
        const response = await api.getGameLeaderboard(id)
        if (response.leaderboard) { this.leaderboardData = response.leaderboard }
      } catch (error) { console.error(error) } finally { this.loadingLeaderboard = false }
    },
    handlePlay() {
      this.$router.push({ name: 'Game', params: { gameId: this.selectedGameId } })
    },

    // Handles keyboard navigation within the menu
    handleKeydown(e) {
      const controls = this.settings?.controls || 'arrows'
      const key = e.key.toLowerCase()
      const code = e.code
      let action = null

      // Prevent native scroll
      if(["ArrowUp","ArrowDown"].includes(code)) e.preventDefault()

      if (controls === 'arrows') {
        if (code === 'ArrowUp') action = 'up'
        if (code === 'ArrowDown') action = 'down'
        if (key === 'enter') action = 'select'
      }
      else if (controls === 'zqsd') {
        if (key === 'z') action = 'up'
        if (key === 's') action = 'down'
        if (key === 'enter' || key === ' ') action = 'select'
      }
      else if (controls === 'wasd') {
        if (key === 'w') action = 'up'
        if (key === 's') action = 'down'
        if (key === 'enter' || key === ' ') action = 'select'
      }

      if (action === 'up') {
        this.navigateWheel(-1)
      }
      if (action === 'down') {
        this.navigateWheel(1)
      }
      if (action === 'select') this.handlePlay()
    },

    navigateWheel(direction) {
      const currentIndex = this.games.findIndex(g => g.id === this.selectedGameId)
      let newIndex = currentIndex + direction
      if (newIndex < 0) newIndex = this.games.length - 1
      if (newIndex >= this.games.length) newIndex = 0
      this.selectGame(this.games[newIndex].id)

      // Visual scrolling
      this.$nextTick(() => {
        const el = this.$refs['gameItem-' + newIndex]
        if (el && el[0]) el[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  }
}
</script>

<style scoped>
/* Styling specifics for the Hub */
.main-screen { height: 100vh; display: flex; flex-direction: column; padding: 20px; overflow: hidden; }
.hub-header { display: flex; justify-content: space-between; align-items: center; height: 80px; margin-bottom: 20px; }
.player-badge { display: flex; align-items: center; gap: 15px; background: rgba(0, 0, 0, 0.6); padding: 10px 20px; border-radius: 4px; }
.avatar-mini { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
.player-details { display: flex; flex-direction: column; gap: 5px; }
.pseudo { color: #FFE66D; font-size: 0.8rem; }
.score { color: #95E1D3; font-size: 0.6rem; }
.header-actions { display: flex; gap: 10px; }
.icon-btn { background: rgba(255, 255, 255, 0.1); border: 2px solid white; color: white; width: 40px; height: 40px; cursor: pointer; font-size: 1.2rem; transition: all 0.2s; }
.icon-btn:hover { background: rgba(255, 255, 255, 0.3); }
.logout-btn { background: #FF6B6B; font-size: 0.7rem !important; padding: 10px 15px !important; }
.arcade-hub { display: flex; gap: 30px; flex: 1; height: calc(100% - 100px); }

/* STYLIZED WHEEL */
.game-wheel-container {
  flex: 0 0 300px; display: flex; flex-direction: column;
  background: rgba(22, 33, 62, 0.9); backdrop-filter: blur(10px); padding: 20px;
}
.wheel-title { text-align: center; color: #95E1D3; margin-bottom: 10px; font-size: 0.8rem; text-shadow: 2px 2px 0 #000; }
.game-wheel {
  flex: 1; display: flex; flex-direction: column; gap: 15px;
  padding: 25px 30px;
  overflow-y: auto; overflow-x: hidden;
  scrollbar-width: thin; scrollbar-color: #FFE66D rgba(0,0,0,0.3);
}
.game-item {
  background: rgba(0, 0, 0, 0.5); padding: 20px; cursor: pointer; display: flex; align-items: center; gap: 15px; transition: all 0.3s;
  opacity: 0.6; position: relative; transform: scale(0.95); backface-visibility: hidden;
}
.game-item:hover { opacity: 0.8; transform: scale(0.98); }
.game-item.active {
  opacity: 1; background: rgba(255, 255, 255, 0.15); border-color: #FFE66D;
  transform: scale(1.02) translateX(5px);
  z-index: 2; box-shadow: -5px 5px 0 rgba(0,0,0,0.5);
}
.game-icon { font-size: 1.5rem; }
.game-label { font-size: 0.8rem; color: white; flex: 1; }
.selection-arrow { color: #FFE66D; animation: blink 1s infinite; }

.game-preview-container { flex: 1; background: rgba(22, 33, 62, 0.9); backdrop-filter: blur(10px); padding: 30px; display: flex; flex-direction: column; gap: 20px; position: relative; }
.preview-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 15px; }
.preview-title { font-size: 2rem; text-shadow: 3px 3px 0 rgba(0,0,0,0.8); margin: 0; }
.genre-tag { background: #333; padding: 5px 10px; font-size: 0.6rem; color: #ccc; border: 1px solid #666; }
.preview-content { display: flex; gap: 20px; flex: 1; overflow: hidden; }
.media-box { flex: 1; border: 4px solid; background: black; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 20px rgba(0,0,0,0.8); min-height: 200px; overflow: hidden; }
.media-placeholder { text-align: center; color: rgba(255,255,255,0.3); }
.game-video { width: 100%; height: 100%; object-fit: cover; display: block; }
.big-icon { font-size: 5rem; display: block; margin-bottom: 10px; }
.info-grid { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.game-info { flex: 1; overflow-y: auto; }
.description { font-size: 0.7rem; line-height: 1.6; margin-bottom: 20px; color: #ddd; }
.controls-box h4, .game-leaderboard h4 { color: #FFE66D; font-size: 0.7rem; margin-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.3); padding-bottom: 5px; }
.control-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.6rem; }
.key-badge { background: #333; color: white; padding: 2px 6px; border: 1px solid #fff; border-radius: 2px; }
.action-text { color: #95E1D3; }
.game-leaderboard { background: rgba(0,0,0,0.3); padding: 15px; border: 2px solid rgba(255,255,255,0.1); }
.leaderboard-list { list-style: none; font-size: 0.6rem; }
.leaderboard-list li { display: flex; justify-content: space-between; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px dotted rgba(255,255,255,0.1); }
.rank { color: #FFE66D; width: 30px; }
.rank.gold { color: #FFD700; text-shadow: 0 0 5px #FFD700; }
.rank.silver { color: #C0C0C0; }
.rank.bronze { color: #CD7F32; }
.name { color: white; flex: 1; }
.points { color: #FF6B6B; font-weight: bold; }
.loading-text { text-align: center; font-size: 0.6rem; color: #999; animation: blink 1s infinite; }
.no-scores { text-align: center; color: #999; font-size: 0.7rem; padding: 10px; }
.play-action { margin-top: auto; }
.play-btn { font-size: 1.2rem; padding: 20px; color: #000; font-weight: bold; animation: pulse 2s infinite; text-shadow: none; }
@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
@keyframes blink { 50% { opacity: 0; } }
@media (max-width: 900px) { .arcade-hub { flex-direction: column; } .game-wheel-container { flex: 0 0 auto; height: 150px; } .preview-content { flex-direction: column; } .media-box { min-height: 150px; } }
</style>