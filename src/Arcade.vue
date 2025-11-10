<template>
  <div class="arcade-container">
    <!-- Écran de démarrage -->
    <transition name="fade">
      <div v-if="!gameStarted" class="start-screen">
        <h1 class="arcade-title">
          <span class="glitch">ARCADE</span>
          <span class="subtitle">GAME</span>
        </h1>
        <button @click="startGame" class="start-button pixel-button">
          START
        </button>
        <div class="insert-coin">INSERT COIN</div>
      </div>
    </transition>

    <!-- Écran de sélection des joueurs -->
    <transition name="slide">
      <div v-if="gameStarted" class="player-select-screen">
        <h2 class="select-title">SELECT PLAYERS</h2>

        <div class="players-grid">
          <div
            v-for="(player, index) in players"
            :key="player.id"
            class="player-card pixel-border"
            :class="{ 'selected': player.selected }"
            @click="togglePlayer(index)"
          >
            <div class="player-avatar">
              <div class="pixel-sprite" :style="{ backgroundColor: player.color }">
                P{{ index + 1 }}
              </div>
            </div>
            <div class="player-name">PLAYER {{ index + 1 }}</div>
            <div class="player-status">
              {{ player.selected ? '✓ READY' : 'PRESS TO JOIN' }}
            </div>
          </div>
        </div>

        <button
          @click="addPlayer"
          class="add-player-button pixel-button"
          :disabled="players.length >= 8"
        >
          + ADD PLAYER
        </button>

        <div class="controls">
          <button @click="goBack" class="back-button pixel-button-small">
            ← BACK
          </button>
          <button
            @click="continueGame"
            class="continue-button pixel-button"
            :disabled="!hasSelectedPlayers"
          >
            CONTINUE →
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'ArcadeGame',
  data() {
    return {
      gameStarted: false,
      players: [
        { id: 1, selected: false, color: '#FF6B6B' },
        { id: 2, selected: false, color: '#4ECDC4' },
        { id: 3, selected: false, color: '#FFE66D' }
      ],
      nextPlayerId: 4
    }
  },
  computed: {
    hasSelectedPlayers() {
      return this.players.some(player => player.selected);
    }
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.playSound();
    },
    togglePlayer(index) {
      this.players[index].selected = !this.players[index].selected;
      this.playSound();
    },
    addPlayer() {
      if (this.players.length < 8) {
        const colors = ['#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF'];
        const newColor = colors[(this.nextPlayerId - 1) % colors.length];

        this.players.push({
          id: this.nextPlayerId,
          selected: false,
          color: newColor
        });
        this.nextPlayerId++;
        this.playSound();
      }
    },
    goBack() {
      this.gameStarted = false;
      this.playSound();
    },
    continueGame() {
      if (this.hasSelectedPlayers) {
        const selectedPlayers = this.players.filter(p => p.selected);
        console.log('Selected players:', selectedPlayers);
        alert(`Starting game with ${selectedPlayers.length} player(s)!`);
        this.playSound();
      }
    },
    playSound() {
      // Simulation d'un son 8-bit (optionnel)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.arcade-container {
  min-height: 100vh;
  font-family: 'Press Start 2P', cursive;
  color: white;
  position: relative;
  overflow: hidden;
}

.arcade-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.15) 0px,
      transparent 1px,
      transparent 2px,
      rgba(0, 0, 0, 0.15) 3px
    );
  pointer-events: none;
  animation: scanlines 8s linear infinite;
}

@keyframes scanlines {
  0% { transform: translateY(0); }
  100% { transform: translateY(10px); }
}

/* Écran de démarrage */
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
  margin-top: 20px;
  color: #FFE66D;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.start-button {
  font-size: 2rem;
  padding: 30px 80px;
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

/* Boutons pixel style */
.pixel-button {
  font-family: 'Press Start 2P', cursive;
  background: #FF6B6B;
  color: white;
  border: 4px solid #000;
  padding: 20px 40px;
  font-size: 1.2rem;
  cursor: pointer;
  position: relative;
  box-shadow:
    -4px 4px 0 #000,
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.1s;
}

.pixel-button:hover {
  background: #ff5252;
  transform: translate(-2px, -2px);
  box-shadow:
    -6px 6px 0 #000,
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.3);
}

.pixel-button:active {
  transform: translate(-1px, -1px);
  box-shadow:
    -2px 2px 0 #000,
    inset -2px -2px 0 rgba(0, 0, 0, 0.5),
    inset 2px 2px 0 rgba(255, 255, 255, 0.2);
}

.pixel-button:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.5;
}

/* Écran de sélection */
.player-select-screen {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.select-title {
  font-size: 2rem;
  margin-bottom: 40px;
  text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.5);
  animation: float 3s ease-in-out infinite;
}

.players-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
  width: 100%;
  margin-bottom: 40px;
}

.player-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.pixel-border {
  border: 4px solid white;
  box-shadow:
    -4px 4px 0 rgba(0, 0, 0, 0.5),
    inset 0 0 0 4px rgba(0, 0, 0, 0.3);
}

.player-card:hover {
  transform: translateX(10px);
  background: rgba(255, 255, 255, 0.2);
}

.player-card.selected {
  background: rgba(255, 255, 255, 0.3);
  border-color: #FFE66D;
  animation: selectedPulse 1s ease-in-out infinite;
}

@keyframes selectedPulse {
  0%, 100% { box-shadow: -4px 4px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 4px rgba(255, 230, 109, 0.5); }
  50% { box-shadow: -4px 4px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 4px rgba(255, 230, 109, 1); }
}

.player-avatar {
  flex-shrink: 0;
}

.pixel-sprite {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 3px solid #000;
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.3);
}

.player-name {
  font-size: 1.1rem;
  flex: 1;
}

.player-status {
  font-size: 0.6rem;
  color: #FFE66D;
  text-align: right;
  flex-shrink: 0;
}

.add-player-button {
  margin-bottom: 30px;
  background: #4ECDC4;
}

.add-player-button:hover {
  background: #45b8b0;
}

.controls {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.pixel-button-small {
  font-family: 'Press Start 2P', cursive;
  background: #666;
  color: white;
  border: 4px solid #000;
  padding: 15px 30px;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow:
    -4px 4px 0 #000,
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.1s;
}

.pixel-button-small:hover {
  background: #555;
  transform: translate(-2px, -2px);
}

.continue-button {
  background: #95E1D3;
}

.continue-button:hover:not(:disabled) {
  background: #7dd3c0;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.5s;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .glitch {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.5rem;
  }

  .start-button {
    font-size: 1.5rem;
    padding: 20px 50px;
  }

  .select-title {
    font-size: 1.3rem;
  }

  .player-card {
    flex-direction: column;
    text-align: center;
  }

  .player-status {
    text-align: center;
  }
}
</style>

