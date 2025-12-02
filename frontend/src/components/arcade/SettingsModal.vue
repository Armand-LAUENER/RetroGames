<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content pixel-border" @click.stop>
      <button class="modal-close" @click="$emit('close')">✕</button>
      <h3 class="modal-title">SETTINGS</h3>

      <div class="setting-group">
        <label>CRT SCANLINES</label>
        <div class="toggle-switch" @click="toggleScanlines">
          <div class="switch-track" :class="{ active: settings.scanlines }">
            <div class="switch-knob"></div>
          </div>
          <span class="status">{{ settings.scanlines ? 'ON' : 'OFF' }}</span>
        </div>
      </div>

      <div class="setting-group">
        <label>CONTROLS (MENU & GAME)</label>
        <div class="controls-options">
          <button
            v-for="scheme in controlSchemes"
            :key="scheme.id"
            class="pixel-button-small"
            :class="{ active: settings.controls === scheme.id }"
            @click="selectControls(scheme.id)"
          >
            {{ scheme.name }}
          </button>
        </div>
        <div class="key-preview">
          <span v-if="settings.controls === 'arrows'">⬆️ ⬇️ ⬅️ ➡️</span>
          <span v-if="settings.controls === 'zqsd'">Z Q S D</span>
          <span v-if="settings.controls === 'wasd'">W A S D</span>
        </div>
      </div>

      <button @click="$emit('close')" class="pixel-button save-btn">
        SAVE & EXIT
      </button>
    </div>
  </div>
</template>

<script>
/* (Le script reste identique à l'original) */
export default {
  name: 'SettingsModal',
  props: {
    currentSettings: { type: Object, required: true }
  },
  emits: ['close', 'update-settings'],
  data() {
    return {
      settings: { ...this.currentSettings },
      controlSchemes: [
        { id: 'arrows', name: 'ARROWS' },
        { id: 'zqsd', name: 'ZQSD (AZERTY)' },
        { id: 'wasd', name: 'WASD (QWERTY)' }
      ]
    }
  },
  methods: {
    toggleScanlines() {
      this.settings.scanlines = !this.settings.scanlines
      this.emitUpdate()
    },
    selectControls(id) {
      this.settings.controls = id
      this.emitUpdate()
    },
    emitUpdate() {
      this.$emit('update-settings', this.settings)
    }
  }
}
</script>

<style scoped>
/* Styles spécifiques Settings seulement */
.setting-group { margin-bottom: 30px; }
.setting-group label {
  display: block; color: #95E1D3; margin-bottom: 15px; font-size: 0.8rem;
}

/* Toggle Switch */
.toggle-switch { display: flex; align-items: center; gap: 15px; cursor: pointer; }
.switch-track {
  width: 60px; height: 30px; background: #333;
  border: 2px solid #fff; position: relative; transition: all 0.2s;
}
.switch-track.active { background: #4ECDC4; }
.switch-knob {
  width: 20px; height: 20px; background: white;
  position: absolute; top: 3px; left: 3px; transition: all 0.2s;
  box-shadow: 2px 2px 0 #000;
}
.switch-track.active .switch-knob { left: 33px; }

/* Controls */
.controls-options { display: flex; gap: 10px; flex-wrap: wrap; }
.pixel-button-small.active {
  background: #FFE66D; color: black; transform: translate(2px, 2px);
}
.key-preview {
  margin-top: 10px; text-align: center; font-size: 1.2rem; color: #FF6B6B;
  height: 30px;
}
.save-btn { margin-top: 20px; width: 100%; }
</style>