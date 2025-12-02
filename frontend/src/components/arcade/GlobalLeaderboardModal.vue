<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content leaderboard-content pixel-border" @click.stop>
      <button class="modal-close" @click="$emit('close')">✕</button>
      <h3 class="modal-title">🏆 GLOBAL RANKING</h3>

      <div class="leaderboard-container">
        <div class="table-header">
          <span class="th-rank">RANK</span>
          <span class="th-player">PLAYER</span>
          <span class="th-score">TOTAL</span>
        </div>

        <div v-if="loading" class="loading-text">Loading data...</div>
        <div v-else-if="players.length === 0" class="loading-text">No data available</div>

        <ul v-else class="ranking-list">
          <li v-for="(player, index) in players" :key="player.id" :class="{ 'my-rank': isMe(player) }">
            <span class="rank" :class="getRankClass(index)">#{{ index + 1 }}</span>
            <div class="player-info">
              <div class="avatar" :style="{ backgroundColor: player.color }"></div>
              <span class="name" :style="{ color: player.color }">{{ player.pseudo }}</span>
            </div>
            <span class="score">{{ formatScore(player.highScore) }} PTS</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
/* (Le script reste identique) */
import api from '../../services/api.js'

export default {
  name: 'GlobalLeaderboardModal',
  props: ['currentUser'],
  emits: ['close'],
  data() { return { players: [], loading: true } },
  async mounted() {
    try {
      const response = await api.getAllUsers()
      if (response.users) this.players = response.users
    } catch (e) { console.error(e) } finally { this.loading = false }
  },
  methods: {
    formatScore(val) { return (val || 0).toLocaleString('fr-FR') },
    getRankClass(i) { if (i === 0) return 'gold'; if (i === 1) return 'silver'; if (i === 2) return 'bronze'; return '' },
    isMe(p) { return this.currentUser && p.id === this.currentUser.id }
  }
}
</script>

<style scoped>
/* Surcharge spécifique pour le leaderboard (plus large) */
.leaderboard-content {
  max-width: 600px;
  height: 80vh;
  display: flex;
  flex-direction: column;
}

.leaderboard-container { flex: 1; overflow: hidden; display: flex; flex-direction: column; border: 2px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); }
.table-header { display: flex; justify-content: space-between; color: #95E1D3; border-bottom: 2px solid white; padding: 15px 10px; font-size: 0.7rem; background: rgba(0,0,0,0.5); }
.ranking-list { list-style: none; overflow-y: auto; flex: 1; padding: 0; margin: 0; }
.ranking-list li { display: flex; align-items: center; justify-content: space-between; padding: 12px 10px; border-bottom: 1px dashed rgba(255,255,255,0.1); font-size: 0.8rem; }
.ranking-list li.my-rank { background: rgba(255, 230, 109, 0.15); border: 1px solid #FFE66D; }

.rank { width: 40px; font-weight: bold; }
.rank.gold { color: #FFD700; }
.rank.silver { color: #C0C0C0; }
.rank.bronze { color: #CD7F32; }

.player-info { flex: 1; display: flex; align-items: center; gap: 10px; }
.avatar { width: 20px; height: 20px; border: 1px solid white; display: inline-block; }
.score { color: #FF6B6B; font-weight: bold; }
.loading-text { text-align: center; padding: 20px; color: #999; }

/* Scrollbar locale pour la liste */
.ranking-list::-webkit-scrollbar { width: 8px; }
.ranking-list::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
.ranking-list::-webkit-scrollbar-thumb { background: #4ECDC4; }
</style>