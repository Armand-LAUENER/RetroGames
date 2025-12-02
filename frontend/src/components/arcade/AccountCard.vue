<template>
  <div class="account-card pixel-border" @click="$emit('select', account)">
    <div class="account-avatar" :style="{ backgroundColor: account.color }">
      {{ account.pseudo.substring(0, 2).toUpperCase() }}
    </div>
    <div class="account-name">{{ account.pseudo }}</div>
    <div class="account-stats">
      <div class="stat-item">🎮 {{ account.gamesPlayed }} Rank</div>
      <div class="stat-item">🏆 {{ account.highScore }} pts</div>
    </div>
    <div class="account-action">CLICK TO LOGIN</div>
  </div>
</template>

<script>
/**
 * AccountCard Component
 * * Represents a single user account summary in the login selection screen.
 * Displays the avatar, username, and key statistics.
 */
export default {
  name: 'AccountCard',
  props: {
    account: {
      type: Object,
      required: true
    }
  },
  emits: ['select']
}
</script>

<style scoped>
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

@keyframes blink {
  50% { opacity: 0; }
}
</style>