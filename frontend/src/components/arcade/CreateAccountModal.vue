<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content pixel-border" @click.stop>
      <button class="modal-close" @click="$emit('close')">✕</button>

      <h3 class="modal-title">CREATE ACCOUNT</h3>

      <div class="form-group">
        <label>EMAIL:</label>
        <input v-model="localData.email" type="email" class="pixel-input" placeholder="your@email.com" />
      </div>

      <div class="form-group">
        <label>USERNAME:</label>
        <input v-model="localData.pseudo" type="text" class="pixel-input" placeholder="Enter username" />
      </div>

      <div class="form-group">
        <label>PASSWORD:</label>
        <input v-model="localData.password" type="password" class="pixel-input" placeholder="Enter password" />
      </div>

      <div class="form-group">
        <label>CONFIRM PASSWORD:</label>
        <input
          v-model="localData.confirmPassword"
          type="password"
          class="pixel-input"
          placeholder="Confirm password"
          @keyup.enter="handleSubmit"
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button @click="handleSubmit" class="pixel-button" :disabled="!isValid">
        CREATE ACCOUNT
      </button>
    </div>
  </div>
</template>

<script>
/**
 * CreateAccountModal Component
 * * Provides a form for new users to register an account.
 * Includes client-side validation for required fields and password matching.
 */
export default {
  name: 'CreateAccountModal',
  props: { error: { type: String, default: '' } },
  emits: ['close', 'submit'],
  data() {
    return {
      localData: { email: '', pseudo: '', password: '', confirmPassword: '' }
    }
  },
  computed: {
    isValid() {
      return (
        this.localData.email &&
        this.localData.pseudo &&
        this.localData.password &&
        this.localData.confirmPassword &&
        this.localData.password === this.localData.confirmPassword &&
        this.localData.password.length >= 6
      )
    }
  },
  methods: {
    handleSubmit() { if (this.isValid) this.$emit('submit', { ...this.localData }) }
  }
}
</script>

<style scoped>
/* Styles are centralized in arcade-styles.css */
</style>