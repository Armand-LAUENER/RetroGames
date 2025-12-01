<template>
  <div class="canvas-wrapper">
    <canvas ref="canvas" width="600" height="400"></canvas>

    <div class="score-display">SCORE: {{ score }}</div>

    <div v-if="gameOver" class="overlay">
      <h3>GAME OVER</h3>
      <p>FINAL SCORE: {{ score }}</p>
      <button @click="resetGame" class="pixel-button-small">RETRY MISSION</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpaceDefender',
  props: ['controls'], // Reçoit 'arrows', 'zqsd', ou 'wasd'
  emits: ['game-over'],
  data() {
    return {
      ctx: null,
      player: { x: 280, y: 360, w: 40, h: 20, speed: 5 },
      bullets: [],
      enemies: [],
      score: 0,
      gameOver: false,
      animationId: null,
      keys: { left: false, right: false, space: false },
      lastShot: 0
    }
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext('2d')
    window.addEventListener('keydown', this.keyDown)
    window.addEventListener('keyup', this.keyUp)
    this.resetGame()
  },
  beforeUnmount() {
    cancelAnimationFrame(this.animationId)
    window.removeEventListener('keydown', this.keyDown)
    window.removeEventListener('keyup', this.keyUp)
  },
  methods: {
    // Gestionnaire d'appui sur une touche
    keyDown(e) {
      const key = e.key.toLowerCase()
      const code = e.code

      // Empêcher le scroll avec Espace ou les flèches
      if(["Space", "ArrowLeft", "ArrowRight"].includes(code)) e.preventDefault()

      if (this.controls === 'arrows') {
        if (code === 'ArrowLeft') this.keys.left = true
        if (code === 'ArrowRight') this.keys.right = true
      } else if (this.controls === 'zqsd') {
        if (key === 'q') this.keys.left = true
        if (key === 'd') this.keys.right = true
      } else if (this.controls === 'wasd') {
        if (key === 'a') this.keys.left = true
        if (key === 'd') this.keys.right = true
      }

      if (code === 'Space') this.keys.space = true
    },
    // Gestionnaire de relâchement d'une touche
    keyUp(e) {
      const key = e.key.toLowerCase()
      const code = e.code

      if (this.controls === 'arrows') {
        if (code === 'ArrowLeft') this.keys.left = false
        if (code === 'ArrowRight') this.keys.right = false
      } else if (this.controls === 'zqsd') {
        if (key === 'q') this.keys.left = false
        if (key === 'd') this.keys.right = false
      } else if (this.controls === 'wasd') {
        if (key === 'a') this.keys.left = false
        if (key === 'd') this.keys.right = false
      }

      if (code === 'Space') this.keys.space = false
    },
    resetGame() {
      this.score = 0
      this.gameOver = false
      this.bullets = []
      this.enemies = []
      this.player.x = 280
      this.spawnEnemies()
      if (!this.animationId) this.loop()
    },
    spawnEnemies() {
      // Créer une grille d'ennemis (5 rangées de 8)
      for(let i=0; i<5; i++) {
        for(let j=0; j<8; j++) {
          this.enemies.push({
            x: 50 + j*60,
            y: 30 + i*40,
            w: 30,
            h: 20,
            alive: true
          })
        }
      }
    },
    update() {
      if (this.gameOver) return

      // Mouvement Joueur
      if (this.keys.left && this.player.x > 0) this.player.x -= this.player.speed
      if (this.keys.right && this.player.x < 560) this.player.x += this.player.speed

      // Tir (Limité à un tir toutes les 300ms)
      if (this.keys.space && Date.now() - this.lastShot > 300) {
        this.bullets.push({ x: this.player.x + 18, y: this.player.y, w: 4, h: 10 })
        this.lastShot = Date.now()
      }

      // Déplacement des balles
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        this.bullets[i].y -= 7
        // Supprimer si hors écran
        if (this.bullets[i].y < 0) {
          this.bullets.splice(i, 1)
        }
      }

      // Logique simple des ennemis (vont descendre si besoin dans une version avancée)
      // Ici, on vérifie juste les collisions

      // Collisions Balle <-> Ennemi
      this.bullets.forEach((b, bi) => {
        this.enemies.forEach((e) => {
          if (e.alive &&
              b.x < e.x + e.w &&
              b.x + b.w > e.x &&
              b.y < e.y + e.h &&
              b.y + b.h > e.y) {
            e.alive = false
            this.bullets.splice(bi, 1)
            this.score += 100
          }
        })
      })

      // Condition de Victoire (Respawn)
      if (this.enemies.every(e => !e.alive)) {
        this.bullets = []
        this.spawnEnemies()
      }

      // Condition de Défaite (Collision Ennemi <-> Joueur non implémentée ici pour simplifier,
      // on pourrait ajouter que si un ennemi touche le bas, c'est perdu)
    },
    draw() {
      // Effacer l'écran
      this.ctx.fillStyle = 'black'
      this.ctx.fillRect(0, 0, 600, 400)

      // Étoiles en fond (générées aléatoirement à chaque frame pour scintillement)
      this.ctx.fillStyle = 'white'
      for(let i=0; i<10; i++) {
        this.ctx.fillRect(Math.random()*600, Math.random()*400, 2, 2)
      }

      // Joueur (Vaisseau)
      this.ctx.fillStyle = '#FF6B6B'
      this.ctx.beginPath()
      this.ctx.moveTo(this.player.x + 20, this.player.y) // Pointe
      this.ctx.lineTo(this.player.x, this.player.y + 20) // Gauche
      this.ctx.lineTo(this.player.x + 40, this.player.y + 20) // Droite
      this.ctx.fill()

      // Balles
      this.ctx.fillStyle = '#FFFF00'
      this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.w, b.h))

      // Ennemis (Aliens)
      this.ctx.fillStyle = '#4ECDC4'
      this.enemies.forEach(e => {
        if (e.alive) {
          this.ctx.fillRect(e.x, e.y, e.w, e.h)
          // Yeux des aliens
          this.ctx.fillStyle = 'black'
          this.ctx.fillRect(e.x + 5, e.y + 5, 5, 5)
          this.ctx.fillRect(e.x + 20, e.y + 5, 5, 5)
          this.ctx.fillStyle = '#4ECDC4' // Remettre la couleur pour le prochain
        }
      })
    },
    loop() {
      if (this.gameOver) return
      this.update()
      this.draw()
      this.animationId = requestAnimationFrame(this.loop)
    },
    endGame() {
      this.gameOver = true
      cancelAnimationFrame(this.animationId)
      this.$emit('game-over', this.score)
    }
  }
}
</script>

<style scoped>
.canvas-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

canvas {
  border: 4px solid #FF6B6B;
  background: black;
  max-width: 100%;
  box-shadow: 0 0 20px rgba(255, 107, 107, 0.2);
}

.score-display {
  position: absolute;
  top: 20px;
  left: 20px;
  color: white;
  font-family: 'Press Start 2P', cursive;
  text-shadow: 2px 2px 0 #000;
}

.overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid #FF6B6B;
  padding: 40px;
  color: #FF6B6B;
}

.overlay h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  animation: blink 1s infinite;
}

@keyframes blink { 50% { opacity: 0; } }
</style>