<template>
  <div class="password-screen">
    <div class="login-card pixel-border">

      <div class="user-preview">
        <div class="avatar-large" :style="{ backgroundColor: account.color }">
          {{ account.pseudo.substring(0, 2).toUpperCase() }}
        </div>
        <h2 class="username">{{ account.pseudo }}</h2>
        <p class="instruction">ENTER PASSWORD TO UNLOCK</p>
      </div>

      <div class="form-group">
        <input
          ref="passwordInput"
          v-model="password"
          type="password"
          class="pixel-input"
          placeholder="****"
          @keyup.enter="submit"
          autofocus
        >
      </div>

      <div v-if="error" class="error-msg">
        {{ error }}
      </div>

      <div class="actions">
        <button
          @click="submit"
          class="pixel-button login-btn"
          :disabled="!password"
        >
          UNLOCK
        </button>

        <button @click="$emit('back')" class="pixel-button-small back-btn">
          CANCEL
        </button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordScreen',
  props: {
    account: {
      type: Object,
      required: true
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['submit', 'back'],
  data() {
    return {
      password: ''
    }
  },
  mounted() {
    // Focus automatique sur le champ mot de passe
    this.$nextTick(() => {
      this.$refs.passwordInput.focus()
    })
  },
  methods: {
    submit() {
      if (this.password) {
        this.$emit('submit', this.password)
      }
    }
  }
}
</script>

<style scoped>
.password-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  background: rgba(22, 33, 62, 0.95);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.user-preview {
  text-align: center;
}

.avatar-large {
  width: 100px;
  height: 100px;
  border: 4px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #000;
  margin: 0 auto 20px;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
}

.username {
  color: #FFE66D;
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 0 #000;
}

.instruction {
  color: #95E1D3;
  font-size: 0.7rem;
}

.form-group {
  width: 100%;
}

.pixel-input {
  width: 100%;
  padding: 15px;
  font-family: 'Press Start 2P', cursive;
  font-size: 1rem;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid white;
  color: white;
}

.pixel-input:focus {
  outline: none;
  border-color: #FFE66D;
  box-shadow: 0 0 15px rgba(255, 230, 109, 0.3);
}

.error-msg {
  color: #FF6B6B;
  font-size: 0.7rem;
  background: rgba(255, 0, 0, 0.1);
  padding: 10px;
  border: 1px solid #FF6B6B;
  width: 100%;
  text-align: center;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.login-btn {
  background: #4ECDC4;
  font-size: 1rem;
}

.back-btn {
  background: #FF6B6B;
}
</style>