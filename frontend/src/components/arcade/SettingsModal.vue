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
export default {
  name: 'SettingsModal',
  props: {
    currentSettings: {
      type: Object,
      required: true
    }
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
/* Réutilisation des styles de base de vos autres modales */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; backdrop-filter: blur(5px);
}
.modal-content {
  background: rgba(22, 33, 62, 0.95);
  padding: 40px; width: 100%; max-width: 500px;
  position: relative; color: white;
}
.modal-title {
  text-align: center; color: #FFE66D; margin-bottom: 30px;
  text-shadow: 3px 3px 0 rgba(0,0,0,0.5);
}
.modal-close {
  position: absolute; top: 15px; right: 15px;
  background: #FF6B6B; border: 3px solid #000; color: white;
  width: 40px; height: 40px; cursor: pointer; font-family: inherit;
}

/* Styles spécifiques Settings */
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