<template>
  <div class="login-screen">
    <h2 class="select-title">SELECT YOUR ACCOUNT</h2>

    <!-- Liste des comptes existants -->
    <div v-if="accounts.length > 0" class="accounts-grid">
      <AccountCard
        v-for="account in accounts"
        :key="account.id"
        :account="account"
        @select="$emit('quick-login', $event)"
      />
    </div>

    <div v-else class="no-accounts-message pixel-border">
      <p>👤 NO ACCOUNTS FOUND</p>
      <p class="sub-message">Create your first account to start playing!</p>
    </div>

    <!-- Boutons d'action -->
    <div class="action-buttons">
      <button @click="$emit('show-login-modal')" class="pixel-button login-btn">
        LOGIN WITH PASSWORD
      </button>
      <button @click="$emit('show-create-modal')" class="pixel-button create-btn">
        CREATE NEW ACCOUNT
      </button>
    </div>

    <div class="controls">
      <button @click="$emit('back')" class="back-button pixel-button-small">
        ← BACK
      </button>
    </div>
  </div>
</template>

<script>
import AccountCard from './AccountCard.vue'

export default {
  name: 'LoginScreen',
  components: {
    AccountCard
  },
  props: {
    accounts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['quick-login', 'show-login-modal', 'show-create-modal', 'back']
}
</script>

<style scoped>
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

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  max-width: 1200px;
  width: 100%;
  margin-bottom: 40px;
}

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

@media (max-width: 768px) {
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
}
</style>
