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
    await this.loadAccounts()
    await this.checkAutoLogin()
    const savedSettings = localStorage.getItem('arcade_settings')
    if (savedSettings) { this.settings = JSON.parse(savedSettings) }
  },
  methods: {
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
          this.currentScreen = 'main'
          this.playSound()
        }
      } catch (error) {
        this.loginError = 'INVALID PASSWORD'
      }
    },
    async openGlobalStats() {
      try {
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
    goToLogin() { this.currentScreen = 'login'; this.playSound() },
    async loadAccounts() {
      try { const response = await api.getAllUsers(); this.accounts = response.users; }
      catch (error) { console.error(error) }
    },
    async checkAutoLogin() {
      try { const response = await api.getProfile(); if (response.user) { this.currentUser = response.user; this.currentScreen = 'main' } }
      catch (error) { api.clearToken() }
    },
    closeCreateForm() { this.showCreateForm = false; this.createError = '' },
    closeLoginForm() { this.showLoginForm = false; this.loginError = '' },
    async createAccount(data) {
       try {
        const response = await api.register({ email: data.email, pseudo: data.pseudo, password: data.password, color: this.colors[Math.floor(Math.random() * this.colors.length)] })
        if (response.user) { this.currentUser = response.user; this.closeCreateForm(); this.currentScreen = 'main'; this.playSound(); await this.loadAccounts() }
      } catch (error) { this.createError = error.message || 'Failed' }
    },
    async loginWithPassword(data) {
      try {
        const response = await api.login({ pseudo: data.pseudo, password: data.password })
        if (response.user) { this.currentUser = response.user; this.closeLoginForm(); this.currentScreen = 'main'; this.playSound() }
      } catch (error) { this.loginError = error.message || 'Invalid credentials' }
    },
    logout() {
      if (confirm(`Logout from ${this.currentUser.pseudo}?`)) { api.logout(); this.currentUser = null; this.currentScreen = 'start'; this.playSound() }
    },
    async startGame() {
      try { await api.startGame(); this.$router.push('/games'); this.playSound() } catch (error) { console.error(error) }
    },
    playSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 800
        oscillator.type = 'square'
        gainNode.gain.value = 0.1
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.1)
      } catch (e) {}
    }
  }
}
</script>

<style scoped>
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