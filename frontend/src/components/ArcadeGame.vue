<template>

  <div class="arcade-container">

    <!-- Écran de démarrage -->
    <transition name="fade">
      <StartScreen
        v-if="currentScreen === 'start'"
        @start="goToLogin"
      />
    </transition>

    <!-- Écran de connexion -->
    <transition name="slide">
      <LoginScreen
        v-if="currentScreen === 'login'"
        :accounts="accounts"
        @quick-login="quickLogin"
        @show-login-modal="showLoginForm = true"
        @show-create-modal="showCreateForm = true"
        @back="currentScreen = 'start'"
      />
    </transition>

    <!-- Écran principal -->
    <transition name="slide">
      <MainScreen
        v-if="currentScreen === 'main'"
        :user="currentUser"
        @start-game="startGame"
        @show-stats="showStats"
        @show-settings="showSettings"
        @logout="logout"
      />
    </transition>

    <!-- Modal de connexion -->
    <transition name="modal-fade">
      <LoginModal
        v-if="showLoginForm"
        :error="loginError"
        @close="closeLoginForm"
        @submit="loginWithPassword"
      />
    </transition>

    <!-- Modal de création de compte -->
    <transition name="modal-fade">
      <CreateAccountModal
        v-if="showCreateForm"
        :error="createError"
        @close="closeCreateForm"
        @submit="createAccount"
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
import Background from "@/components/arcade/Background.vue";

export default {
  name: 'ArcadeGame',
  components: {
    Background,
    StartScreen,
    LoginScreen,
    MainScreen,
    LoginModal,
    CreateAccountModal
  },
  data() {
    return {
      currentScreen: 'start',
      currentUser: null,
      showLoginForm: false,
      showCreateForm: false,
      loginError: '',
      createError: '',
      accounts: [],
      colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#A8E6CF']
    }
  },
  async mounted() {
    await this.loadAccounts()
    await this.checkAutoLogin()
  },
  methods: {
    goToLogin() {
      this.currentScreen = 'login'
      this.playSound()
    },

    async loadAccounts() {
      try {
        const response = await api.getAllUsers()
        this.accounts = response.users
      } catch (error) {
        console.error('Error loading accounts:', error)
      }
    },

    async checkAutoLogin() {
      try {
        const response = await api.getProfile()
        if (response.success) {
          this.currentUser = response.user
          this.currentScreen = 'main'
        }
      } catch (error) {
        api.clearToken()
      }
    },

    closeCreateForm() {
      this.showCreateForm = false
      this.createError = ''
    },

    closeLoginForm() {
      this.showLoginForm = false
      this.loginError = ''
    },

    async createAccount(data) {
      this.createError = ''

      if (data.password.length < 6) {
        this.createError = 'Password must be at least 6 characters!'
        return
      }

      if (data.password !== data.confirmPassword) {
        this.createError = 'Passwords do not match!'
        return
      }

      try {
        const response = await api.register({
          email: data.email,
          pseudo: data.pseudo,
          password: data.password,
          color: this.colors[Math.floor(Math.random() * this.colors.length)]
        })

        if (response.success) {
          this.currentUser = response.user
          this.closeCreateForm()
          this.currentScreen = 'main'
          this.playSound()

          setTimeout(() => {
            alert(`🎉 Welcome ${this.currentUser.pseudo}!\n\nYour account has been created successfully!`)
          }, 500)

          await this.loadAccounts()
        }
      } catch (error) {
        this.createError = error.message || 'Failed to create account'
      }
    },

    async loginWithPassword(data) {
      this.loginError = ''

      try {
        const response = await api.login({
          pseudo: data.pseudo,
          password: data.password
        })

        if (response.success) {
          this.currentUser = response.user
          this.closeLoginForm()
          this.currentScreen = 'main'
          this.playSound()
        }
      } catch (error) {
        this.loginError = error.message || 'Invalid credentials'
      }
    },

    async quickLogin(account) {
      const password = prompt(`🔒 Enter password for ${account.pseudo}:`)

      if (password === null) return

      try {
        const response = await api.login({
          pseudo: account.pseudo,
          password: password
        })

        if (response.success) {
          this.currentUser = response.user
          this.currentScreen = 'main'
          this.playSound()
        }
      } catch (error) {
        alert('❌ Invalid password!')
      }
    },

    logout() {
      if (confirm(`Logout from ${this.currentUser.pseudo}?`)) {
        api.logout()
        this.currentUser = null
        this.currentScreen = 'start'
        this.playSound()
      }
    },

    async startGame() {
      try {
        await api.startGame()

        console.log('Starting game for:', this.currentUser.pseudo)
        alert(`🎮 Starting game for ${this.currentUser.pseudo}!\n\nGood luck!`)

        const response = await api.getProfile()
        if (response.success) {
          this.currentUser = response.user
        }

        await this.loadAccounts()
        this.playSound()
      } catch (error) {
        console.error('Error starting game:', error)
      }
    },

    showStats() {
      alert(`📊 Stats for ${this.currentUser.pseudo}\n\nGames Played: ${this.currentUser.gamesPlayed}\nHigh Score: ${this.currentUser.highScore}`)
    },

    showSettings() {
      alert('⚙️ Settings coming soon!')
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
      } catch (e) {
        // Silence errors
      }
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
  background: transparent;
}

.arcade-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  animation: scanlines 8s linear infinite;
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

.modal-fade-enter-from :deep(.modal-content),
.modal-fade-leave-to :deep(.modal-content) {
  transform: scale(0.8) translateY(-50px);
}
</style>
