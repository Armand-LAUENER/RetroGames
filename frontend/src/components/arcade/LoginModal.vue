<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content pixel-border" @click.stop>
      <button class="modal-close" @click="$emit('close')">✕</button>

      <h3 class="modal-title">LOGIN</h3>

      <div class="form-group">
        <label>USERNAME:</label>
        <input
          v-model="localData.pseudo"
          type="text"
          class="pixel-input"
          placeholder="Enter username"
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
/**
 * LoginModal Component
 * * Provides a form for users to log in manually using their username and password.
 */
export default {
  name: 'LoginModal',
  props: {
    error: { type: String, default: '' }
  },
  emits: ['close', 'submit'],
  data() {
    return {
      localData: { pseudo: '', password: '' }
    }
  },
  computed: {
    isValid() { return this.localData.pseudo && this.localData.password }
  },
  methods: {
    handleSubmit() { if (this.isValid) this.$emit('submit', { ...this.localData }) }
  }
}
</script>

<style scoped>
/* All common styles are centralized in arcade-styles.css */
</style>