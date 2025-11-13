<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content pixel-border" @click.stop>
      <button class="modal-close" @click="$emit('close')">✕</button>

      <h3 class="modal-title">LOGIN</h3>

      <div class="form-group">
        <label>PSEUDO:</label>
        <input
          v-model="localData.pseudo"
          type="text"
          class="pixel-input"
          placeholder="Enter pseudo"
          @keyup.enter="handleSubmit"
        />
      </div>

      <div class="form-group">
        <label>PASSWORD:</label>
        <input
          v-model="localData.password"
          type="password"
          class="pixel-input"
          placeholder="Enter password"
          @keyup.enter="handleSubmit"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button
        @click="handleSubmit"
        class="pixel-button"
        :disabled="!isValid"
      >
        LOGIN
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginModal',
  props: {
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      localData: {
        pseudo: '',
        password: ''
      }
    }
  },
  computed: {
    isValid() {
      return this.localData.pseudo && this.localData.password
    }
  },
  methods: {
    handleSubmit() {
      if (this.isValid) {
        this.$emit('submit', { ...this.localData })
      }
    }
  }
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .modal-content {
    padding: 30px 20px;
  }

  .pixel-input {
    font-size: 0.7rem;
    padding: 12px;
  }
}
</style>
