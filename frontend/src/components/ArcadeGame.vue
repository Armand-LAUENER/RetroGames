<template>
  <div class="arcade-container" :class="{ 'scanlines-enabled': settings.scanlines }">

    <Background />

    <transition name="fade">
      <StartScreen v-if="currentScreen === 'start'" @start="goToLogin" />
    </transition>

    <transition name="slide">
      <LoginScreen
        v-if="currentScreen === 'login'"
        :accounts="accounts"
        @quick-login="selectAccount"
        @show-login-modal="showLoginForm = true"
        @show-create-modal="showCreateForm = true"
        @back="currentScreen = 'start'"
      />
    </transition>

    <transition name="slide">
      <PasswordScreen
        v-if="currentScreen === 'password'"
        :account="selectedAccount"
        :error="loginError"
        @submit="handleUnlock"
        @back="currentScreen = 'login'; loginError = ''"
      />
    </transition>

    <transition name="slide">
      <MainScreen
        v-if="currentScreen === 'main'"
        :user="currentUser"
        :settings="settings"
        @start-game="startGame"
        @show-stats="openGlobalStats"
        @show-settings="showSettingsModal = true"
        @logout="logout"
        @open-new-page="$router.push('/games')"
      />
    </transition>

    <transition name="modal-fade">
      <LoginModal v-if="showLoginForm" :error="loginError" @close="closeLoginForm" @submit="loginWithPassword" />
    </transition>

    <transition name="modal-fade">
      <CreateAccountModal v-if="showCreateForm" :error="createError" @close="closeCreateForm" @submit="createAccount" />
    </transition>

    <transition name="modal-fade">
      <SettingsModal
        v-if="showSettingsModal"
        :current-settings="settings"
        @update-settings="updateSettings"
        @close="showSettingsModal = false"
      />
    </transition>

    <transition name="modal-fade">
      <GlobalLeaderboardModal
        v-if="showGlobalStats"
        :players="globalPlayers"
        :current-user="currentUser"
        @close="showGlobalStats = false"
      />
    </transition>

  </div>
</template>

<script>
import api from '../services/api.js'
import StartScreen from './arcade/StartScreen.vue'
import LoginScreen from './arcade/LoginScreen.vue'
import MainScreen from './arcade/MainScreen.vue'
import LoginModal from './arcade/LoginModal.vue'
import CreateAccountModal from './arcade/CreateAccountModal.vue'
import SettingsModal from './arcade/SettingsModal.vue'
import Background from '@/components/arcade/Background.vue'
import GlobalLeaderboardModal from './arcade/GlobalLeaderboardModal.vue'
import PasswordScreen from './arcade/PasswordScreen.vue'

export default {
  name: 'ArcadeGame',
  components: {
    Background, StartScreen, LoginScreen, MainScreen,
    LoginModal, CreateAccountModal, SettingsModal, GlobalLeaderboardModal,
    PasswordScreen
  },
  data() {
    return {
      currentScreen: 'start',
      currentUser: null,
      selectedAccount: null,
      showLoginForm: false,
      showCreateForm: false,
      showSettingsModal: false,
      showGlobalStats: false,
      loginError: '',
      createError: '',
      accounts: [],
      globalPlayers: [],
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'],
      settings: { scanlines: true, controls: 'arrows' }
    }
  },
  async mounted() {
    await this.loadAccounts() // Charge depuis le LocalStorage
    await this.checkAutoLogin()

    const savedSettings = localStorage.getItem('arcade_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        this.settings = { ...this.settings, ...parsed }
      } catch (e) {
        console.error("Erreur chargement settings", e)
      }
    }
  },
  methods: {
    // --- CHANGEMENT 1 : Charger les comptes depuis le navigateur uniquement ---
    loadAccounts() {
      try {
        const stored = localStorage.getItem('arcade_known_accounts');
        if (stored) {
          this.accounts = JSON.parse(stored);
        } else {
          this.accounts = [];
        }
      } catch (error) {
        console.error('Erreur lecture localStorage:', error);
        this.accounts = [];
      }
    },

    // --- CHANGEMENT 2 : Sauvegarder un compte localement après connexion ---
    rememberAccount(user) {
      // 1. Récupérer la liste actuelle
      let known = this.accounts;

      // 2. Vérifier si l'utilisateur est déjà dedans (pour le mettre à jour)
      const index = known.findIndex(u => u.id === user.id);

      if (index !== -1) {
        // Mise à jour des infos (score, etc.)
        known[index] = user;
      } else {
        // Ajout nouveau
        known.push(user);
      }

      // 3. Mettre à jour l'état et le LocalStorage
      this.accounts = known;
      localStorage.setItem('arcade_known_accounts', JSON.stringify(known));
    },

    selectAccount(account) {
      this.selectedAccount = account
      this.loginError = ''
      this.currentScreen = 'password'
      this.playSound()
    },

    async handleUnlock(password) {
      this.loginError = ''
      try {
        const response = await api.login({
          pseudo: this.selectedAccount.pseudo,
          password: password
        })
        if (response.user) {
          this.currentUser = response.user
          this.rememberAccount(this.currentUser) // Mise à jour des infos locales
          this.currentScreen = 'main'
          this.playSound()
        }
      } catch (error) {
        this.loginError = 'INVALID PASSWORD'
      }
    },

    async openGlobalStats() {
      try {
        // Pour le classement, on continue de charger TOUT le monde depuis l'API, c'est normal
        const response = await api.getAllUsers()
        if (response.users) {
          this.globalPlayers = response.users
          this.showGlobalStats = true
        }
      } catch (e) {
        console.error("Impossible de charger le classement global", e)
      }
    },

    updateSettings(newSettings) {
      this.settings = newSettings
      localStorage.setItem('arcade_settings', JSON.stringify(newSettings))
    },

    goToLogin() {
      this.loadAccounts(); // Rafraîchir la liste locale
      this.currentScreen = 'login';
      this.playSound()
    },

    async checkAutoLogin() {
      try {
        const response = await api.getProfile();
        if (response.user) {
          this.currentUser = response.user;
          this.rememberAccount(this.currentUser); // On se souvient de lui
          this.currentScreen = 'main'
        }
      }
      catch (error) { api.clearToken() }
    },

    closeCreateForm() { this.showCreateForm = false; this.createError = '' },
    closeLoginForm() { this.showLoginForm = false; this.loginError = '' },

    async createAccount(data) {
       try {
        const response = await api.register({ email: data.email, pseudo: data.pseudo, password: data.password, color: this.colors[Math.floor(Math.random() * this.colors.length)] })
        if (response.user) {
          this.currentUser = response.user;
          this.rememberAccount(this.currentUser); // SAUVEGARDE LOCALE ICI
          this.closeCreateForm();
          this.currentScreen = 'main';
          this.playSound();
        }
      } catch (error) { this.createError = error.message || 'Failed' }
    },

    async loginWithPassword(data) {
      try {
        const response = await api.login({ pseudo: data.pseudo, password: data.password })
        if (response.user) {
          this.currentUser = response.user;
          this.rememberAccount(this.currentUser); // SAUVEGARDE LOCALE ICI
          this.closeLoginForm();
          this.currentScreen = 'main';
          this.playSound()
        }
      } catch (error) { this.loginError = error.message || 'Invalid credentials' }
    },

    logout() {
      if (confirm(`Logout from ${this.currentUser.pseudo}?`)) {
        api.logout();
        this.currentUser = null;
        this.currentScreen = 'start';
        this.playSound()
      }
    },

    async startGame() {
      try {
        await api.startGame()
        this.$router.push('/games')
        this.playSound()
      } catch (error) { console.error(error) }
    },

    playSound() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (!AudioContext) return
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        const now = ctx.currentTime
        osc.frequency.setValueAtTime(800, now)
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08)
        gain.gain.setValueAtTime(0.15, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
        osc.start()
        osc.stop(now + 0.08)
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
/* Les styles restent identiques, gérés globalement */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
.arcade-container { min-height: 100vh; font-family: 'Press Start 2P', cursive; color: white; position: relative; overflow: hidden; background: transparent; --scan-width: 2px; --scan-color: rgba(0, 0, 0, 0.35); --scan-opacity: 0.8; --scan-fps: 60; --scan-z-index: 9999; }
@keyframes scanline-move { 0% { transform: translate3d(0, 500vh, 0); } 100% { transform: translate3d(0, -500vh, 0); } }
@keyframes scanlines-flicker { 0% { background-position: 100%; } 100% { background-position: 0 80%; } }
.arcade-container.scanlines-enabled::before { content: ""; position: fixed; left: 0; right: 0; top: 0; height: var(--scan-width); background: var(--scan-color); opacity: var(--scan-opacity); animation: scanline-move 6s linear infinite; z-index: calc(var(--scan-z-index) + 1); pointer-events: none; will-change: transform; }
.arcade-container.scanlines-enabled::after { content: ""; position: fixed; inset: 0; z-index: var(--scan-z-index); background: linear-gradient(to bottom, transparent 50%, var(--scan-color) 51%); background-size: 100% calc(var(--scan-width) * 2); animation: scanlines-flicker 1s steps(var(--scan-fps)) infinite; pointer-events: none; will-change: background-position; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; } .fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: all 0.5s; } .slide-enter-from { transform: translateX(100%); opacity: 0; } .slide-leave-to { transform: translateX(-100%); opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s; } .modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; } .modal-fade-enter-from :deep(.modal-content), .modal-fade-leave-to :deep(.modal-content) { transform: scale(0.8) translateY(-50px); }
</style>