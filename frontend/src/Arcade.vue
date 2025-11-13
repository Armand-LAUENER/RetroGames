<template>
  <div class="arcade-container">
    <!-- Écran de démarrage -->
    <transition name="fade">
      <div v-if="currentScreen === 'start'" class="start-screen">
        <h1 class="arcade-title">
          <span class="glitch">ARCADE</span>
          <span class="subtitle">GAME</span>
        </h1>
        <button @click="goToLogin" class="start-button pixel-button">
          START
        </button>
        <div class="insert-coin">INSERT COIN</div>
      </div>
    </transition>

    <!-- Écran de connexion -->
    <transition name="slide">
      <div v-if="currentScreen === 'login'" class="login-screen">
        <h2 class="select-title">SELECT YOUR ACCOUNT</h2>

        <!-- Liste des comptes existants -->
        <div v-if="accounts.length > 0" class="accounts-grid">
          <div
            v-for="account in accounts"
            :key="account.id"
            class="account-card pixel-border"
            @click="quickLogin(account)"
          >
            <div class="account-avatar" :style="{ backgroundColor: account.color }">
              {{ account.pseudo.substring(0, 2).toUpperCase() }}
            </div>
            <div class="account-name">{{ account.pseudo }}</div>
            <div class="account-stats">
              <div class="stat-item"> {{ account.gamesPlayed }} Rank</div>
              <div class="stat-item"> {{ account.highScore }} pts</div>
            </div>
            <div class="account-action">CLICK TO LOGIN</div>
          </div>
        </div>

        <div v-else class="no-accounts-message pixel-border">
          <p>👤 NO ACCOUNTS FOUND</p>
          <p class="sub-message">Create your first account to start playing!</p>
        </div>

        <!-- Boutons d'action -->
        <div class="action-buttons">
          <button @click="showLoginForm = true" class="pixel-button login-btn">
            LOGIN WITH PASSWORD
          </button>
          <button @click="openCreateAccountModal" class="pixel-button create-btn">
            CREATE NEW ACCOUNT
          </button>
        </div>

        <div class="controls">
          <button @click="currentScreen = 'start'" class="back-button pixel-button-small">
            ← BACK
          </button>
        </div>
      </div>
    </transition>

    <!-- Écran principal (après connexion) -->
    <transition name="slide">
      <div v-if="currentScreen === 'main'" class="main-screen">
        <div class="user-card pixel-border">
          <div class="user-header">
            <div class="user-avatar" :style="{ backgroundColor: currentUser.color }">
              {{ currentUser.pseudo.substring(0, 2).toUpperCase() }}
            </div>
            <div class="user-info">
              <h2 class="user-name">{{ currentUser.pseudo }}</h2>
              <p class="user-email">{{ currentUser.email }}</p>
              <p class="user-stats">Member since: {{ formatDate(currentUser.createdAt) }}</p>
            </div>
          </div>

          <div class="user-actions">
            <button @click="startGame" class="pixel-button start-game-btn">
              🎮 START GAME
            </button>

            <div class="secondary-actions">
              <button @click="showStats" class="pixel-button-small">
                📊 STATS
              </button>
              <button @click="showSettings" class="pixel-button-small">
                ⚙️ SETTINGS
              </button>
            </div>
          </div>
        </div>

        <div class="controls">
          <button @click="logout" class="back-button pixel-button-small">
            ← LOGOUT
          </button>
        </div>

        <!-- Section des dernières parties -->
        <div class="recent-games pixel-border">
          <h3>RECENT GAMES</h3>
          <div class="no-games">
            No games played yet. Start your first game!
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal de connexion avec mot de passe -->
    <transition name="modal-fade">
      <div v-if="showLoginForm" class="modal-overlay" @click="closeLoginForm">
        <div class="modal-content pixel-border" @click.stop>
          <button class="modal-close" @click="closeLoginForm">✕</button>

          <h3 class="modal-title">LOGIN</h3>

          <div class="form-group">
            <label>PSEUDO:</label>
            <input
              v-model="loginData.pseudo"
              type="text"
              class="pixel-input"
              placeholder="Enter pseudo"
              @keyup.enter="loginWithPassword"
            />
          </div>

          <div class="form-group">
            <label>PASSWORD:</label>
            <input
              v-model="loginData.password"
              type="password"
              class="pixel-input"
              placeholder="Enter password"
              @keyup.enter="loginWithPassword"
            />
          </div>

          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>

          <button
            @click="loginWithPassword"
            class="pixel-button"
            :disabled="!loginData.pseudo || !loginData.password"
          >
            LOGIN
          </button>
        </div>
      </div>
    </transition>

    <!-- Modal de création de compte -->
    <transition name="modal-fade">
      <div v-if="showCreateForm" class="modal-overlay" @click="closeCreateForm">
        <div class="modal-content pixel-border" @click.stop>
          <button class="modal-close" @click="closeCreateForm">✕</button>

          <h3 class="modal-title">CREATE ACCOUNT</h3>

          <div class="form-group">
            <label>EMAIL:</label>
            <input
              v-model="createData.email"
              type="email"
              class="pixel-input"
              placeholder="your@email.com"
            />
          </div>

          <div class="form-group">
            <label>PSEUDO:</label>
            <input
              v-model="createData.pseudo"
              type="text"
              class="pixel-input"
              placeholder="Enter pseudo"
            />
          </div>

          <div class="form-group">
            <label>PASSWORD:</label>
            <input
              v-model="createData.password"
              type="password"
              class="pixel-input"
              placeholder="Enter password"
            />
          </div>

          <div class="form-group">
            <label>CONFIRM PASSWORD:</label>
            <input
              v-model="createData.confirmPassword"
              type="password"
              class="pixel-input"
              placeholder="Confirm password"
              @keyup.enter="createAccount"
            />
          </div>

          <div v-if="createError" class="error-message">
            {{ createError }}
          </div>

          <button
            @click="createAccount"
            class="pixel-button"
            :disabled="!isCreateFormValid"
          >
            CREATE ACCOUNT
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from './services/api.js';

export default {
  name: 'ArcadeGame',
  data() {
    return {
      currentScreen: 'start',
      currentUser: null,
      showLoginForm: false,
      showCreateForm: false,
      loginData: {
        pseudo: '',
        password: ''
      },
      createData: {
        email: '',
        pseudo: '',
        password: '',
        confirmPassword: ''
      },
      loginError: '',
      createError: '',
      accounts: [],
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF']
    }
  },
  computed: {
    isCreateFormValid() {
      return this.createData.email &&
             this.createData.pseudo &&
             this.createData.password &&
             this.createData.confirmPassword &&
             this.createData.password === this.createData.confirmPassword &&
             this.createData.password.length >= 6;
    }
  },
  async mounted() {
    await this.loadAccounts();
    await this.checkAutoLogin();
  },
  methods: {
    goToLogin() {
      this.currentScreen = 'login';
      this.playSound();
    },

    async loadAccounts() {
      try {
        const response = await api.getAllUsers();
        this.accounts = response.users;
      } catch (error) {
        console.error('Error loading accounts:', error);
      }
    },

    async checkAutoLogin() {
      try {
        const response = await api.getProfile();
        if (response.success) {
          this.currentUser = response.user;
          this.currentScreen = 'main';
        }
      } catch (error) {
        // Pas de session active
        api.clearToken();
      }
    },

    openCreateAccountModal() {
      this.showCreateForm = true;
      this.createError = '';
      this.playSound();
    },

    closeCreateForm() {
      this.showCreateForm = false;
      this.createData = {
        email: '',
        pseudo: '',
        password: '',
        confirmPassword: ''
      };
      this.createError = '';
    },

    closeLoginForm() {
      this.showLoginForm = false;
      this.loginData = {
        pseudo: '',
        password: ''
      };
      this.loginError = '';
    },

    async createAccount() {
      this.createError = '';

      if (this.createData.password.length < 6) {
        this.createError = 'Password must be at least 6 characters!';
        return;
      }

      if (this.createData.password !== this.createData.confirmPassword) {
        this.createError = 'Passwords do not match!';
        return;
      }

      try {
        const response = await api.register({
          email: this.createData.email,
          pseudo: this.createData.pseudo,
          password: this.createData.password,
          color: this.colors[Math.floor(Math.random() * this.colors.length)]
        });

        if (response.success) {
          this.currentUser = response.user;
          this.closeCreateForm();
          this.currentScreen = 'main';
          this.playSound();

          setTimeout(() => {
            alert(`🎉 Welcome ${this.currentUser.pseudo}!\n\nYour account has been created successfully!`);
          }, 500);

          await this.loadAccounts();
        }
      } catch (error) {
        this.createError = error.message || 'Failed to create account';
      }
    },

    async loginWithPassword() {
      this.loginError = '';

      try {
        const response = await api.login({
          pseudo: this.loginData.pseudo,
          password: this.loginData.password
        });

        if (response.success) {
          this.currentUser = response.user;
          this.closeLoginForm();
          this.currentScreen = 'main';
          this.playSound();
        }
      } catch (error) {
        this.loginError = error.message || 'Invalid credentials';
      }
    },

    async quickLogin(account) {
      const password = prompt(`🔒 Enter password for ${account.pseudo}:`);

      if (password === null) return;

      try {
        const response = await api.login({
          pseudo: account.pseudo,
          password: password
        });

        if (response.success) {
          this.currentUser = response.user;
          this.currentScreen = 'main';
          this.playSound();
        }
      } catch (error) {
        alert('❌ Invalid password!');
      }
    },

    logout() {
      if (confirm(`Logout from ${this.currentUser.pseudo}?`)) {
        api.logout();
        this.currentUser = null;
        this.currentScreen = 'start';
        this.playSound();
      }
    },

    async startGame() {
      try {
        await api.startGame();

        console.log('Starting game for:', this.currentUser.pseudo);
        alert(`🎮 Starting game for ${this.currentUser.pseudo}!\n\nGood luck!`);

        // Recharger les données utilisateur
        const response = await api.getProfile();
        if (response.success) {
          this.currentUser = response.user;
        }

        await this.loadAccounts();
        this.playSound();
      } catch (error) {
        console.error('Error starting game:', error);
      }
    },

    showStats() {
      alert(`📊 Stats for ${this.currentUser.pseudo}\n\nGames Played: ${this.currentUser.gamesPlayed}\nHigh Score: ${this.currentUser.highScore}`);
    },

    showSettings() {
      alert('⚙️ Settings coming soon!');
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },

    playSound() {
      try {
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
      } catch (e) {
        // Silence errors
      }
    }
  }
}
</script>
>

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
  background: transparent;
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
  margin-top: 50px;
  color: #FFE66D;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.start-button {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 150px;
  width: 100%;
  margin-bottom: 5px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 95% { transform: scale(1); }
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

/* Écran de connexion */
.login-screen {
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.select-title {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 50px;
  color: #FFE66D;
  text-shadow:
    4px 4px 0 rgba(0, 0, 0, 0.5),
    -2px -2px 0 rgba(255, 230, 109, 0.3);
  animation: float 3s ease-in-out infinite;
}

/* Grille des comptes */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1200px;
  width: 100%;
  margin-bottom: 40px;
}

.account-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.account-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.account-card:hover::before {
  left: 100%;
}

.account-card:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-10px) scale(1.03);
  box-shadow:
    -6px 6px 0 rgba(0, 0, 0, 0.5),
    0 10px 30px rgba(255, 230, 109, 0.3);
}

.account-avatar {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  border: 4px solid #000;
  box-shadow:
    inset 0 0 0 4px rgba(255, 255, 255, 0.3),
    -4px 4px 0 rgba(0, 0, 0, 0.5);
  transition: transform 0.3s;
}

.account-card:hover .account-avatar {
  transform: rotate(5deg) scale(1.1);
}

.account-name {
  font-size: 1.2rem;
  text-align: center;
  color: #FFE66D;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
}

.account-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.stat-item {
  font-size: 0.7rem;
  color: #95E1D3;
  text-align: center;
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border: 2px solid rgba(149, 225, 211, 0.3);
}

.account-action {
  font-size: 0.6rem;
  color: #FF6B6B;
  text-align: center;
  animation: blink 1.5s step-start infinite;
}

/* Message aucun compte */
.no-accounts-message {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 50px;
  text-align: center;
  max-width: 600px;
  width: 100%;
  margin-bottom: 40px;
}

.no-accounts-message p {
  font-size: 1.2rem;
  color: #FFE66D;
  margin-bottom: 20px;
}

.sub-message {
  font-size: 0.7rem !important;
  color: #95E1D3 !important;
}

/* Boutons d'action */
.action-buttons {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 800px;
  width: 100%;
  margin-bottom: 30px;
}

.action-buttons .pixel-button {
  flex: 1;
  min-width: 300px;
}

.login-btn {
  background: #4ECDC4;
}

.login-btn:hover {
  background: #45b8b0;
}

.create-btn {
  background: #95E1D3;
}

.create-btn:hover {
  background: #7dd3c0;
}

/* Écran principal */
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

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: rgba(22, 33, 62, 0.95);
  backdrop-filter: blur(20px);
  padding: 40px;
  max-width: 500px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #FF6B6B;
  border: 3px solid #000;
  color: white;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  font-family: 'Press Start 2P', cursive;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-close:hover {
  background: #ff5252;
  transform: rotate(90deg);
}

.modal-title {
  font-size: 1.3rem;
  margin-bottom: 30px;
  text-align: center;
  color: #FFE66D;
  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.5);
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.8rem;
  color: #FFE66D;
}

.pixel-input {
  width: 100%;
  padding: 15px;
  font-family: 'Press Start 2P', cursive;
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid white;
  color: white;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.pixel-input:focus {
  outline: none;
  border-color: #FFE66D;
  box-shadow:
    inset 0 0 10px rgba(255, 230, 109, 0.3),
    0 0 20px rgba(255, 230, 109, 0.3);
}

.pixel-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.6rem;
}

.error-message {
  background: rgba(255, 0, 0, 0.2);
  border: 2px solid #ff0000;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 0.7rem;
  color: #ff6b6b;
  text-align: center;
}

/* Boutons */
.pixel-button {
  font-family: 'Press Start 2P', cursive;
  background: #FF6B6B;
  color: white;
  border: 4px solid #000;
  padding: 20px 40px;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  box-shadow:
    -4px 4px 0 #000,
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.1s;
  width: 100%;
}

.pixel-button:hover:not(:disabled) {
  background: #ff5252;
  transform: translate(-2px, -2px);
  box-shadow:
    -6px 6px 0 #000,
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.3);
}

.pixel-button:active:not(:disabled) {
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

.pixel-button-small {
  font-family: 'Press Start 2P', cursive;
  background: #666;
  color: white;
  border: 4px solid #000;
  padding: 15px 30px;
  font-size: 0.8rem;
  cursor: pointer;
  box-shadow:
    -4px 4px 0 #000,
    inset -4px -4px 0 rgba(0, 0, 0, 0.3),
    inset 4px 4px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.1s;
  flex: 1;
}

.pixel-button-small:hover {
  background: #555;
  transform: translate(-2px, -2px);
}

.pixel-border {
  border: 4px solid white;
  box-shadow:
    -4px 4px 0 rgba(0, 0, 0, 0.5),
    inset 0 0 0 4px rgba(0, 0, 0, 0.3);
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

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: all 0.3s;
}

.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.8) translateY(-50px);
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

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .pixel-button {
    min-width: auto;
  }

  .modal-content {
    padding: 30px 20px;
  }

  .pixel-input {
    font-size: 0.7rem;
    padding: 12px;
  }

  .pixel-button {
    font-size: 0.8rem;
    padding: 15px 30px;
  }

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

/* Scrollbar personnalisée */
.modal-content::-webkit-scrollbar {
  width: 10px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.modal-content::-webkit-scrollbar-thumb {
  background: #FFE66D;
  border: 2px solid #000;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #ffd93d;
}
</style>
