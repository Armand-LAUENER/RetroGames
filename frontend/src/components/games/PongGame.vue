<template>
  <div class="canvas-wrapper">
    <canvas ref="canvas" width="600" height="400"></canvas>
    <div class="score-display">P1: {{ scorePlayer }} | CPU: {{ scoreCpu }}</div>
    <div v-if="paused" class="overlay">CLICK TO START</div>
  </div>
</template>

<script>
export default {
  props: ['controls'],
  emits: ['game-over'],
  data() { return { ball: {x:300, y:200, dx:4, dy:4, size:10}, paddleHeight:80, playerY:160, cpuY:160, scorePlayer:0, scoreCpu:0, paused:true, gameLoop:null } },
  mounted() {
    this.ctx = this.$refs.canvas.getContext('2d')
    window.addEventListener('keydown', this.handleKey)
    this.$refs.canvas.addEventListener('click', () => { if(this.paused) { this.paused = false; this.loop() } })
    this.draw()
  },
  beforeUnmount() { cancelAnimationFrame(this.gameLoop); window.removeEventListener('keydown', this.handleKey) },
  methods: {
    handleKey(e) {
      const key = e.key.toLowerCase()
      let up = false, down = false

      if (this.controls === 'arrows') {
        if (e.code === 'ArrowUp') up = true
        if (e.code === 'ArrowDown') down = true
      } else if (this.controls === 'zqsd') {
        if (key === 'z') up = true
        if (key === 's') down = true
      } else if (this.controls === 'wasd') {
        if (key === 'w') up = true
        if (key === 's') down = true
      }

      if (up) this.playerY -= 20
      if (down) this.playerY += 20
      // Limites
      this.playerY = Math.max(0, Math.min(320, this.playerY))
    },
    update() {
      // IA
      if (this.cpuY + 40 < this.ball.y) this.cpuY += 3; else this.cpuY -= 3
      this.ball.x += this.ball.dx; this.ball.y += this.ball.dy
      if (this.ball.y < 0 || this.ball.y > 400) this.ball.dy *= -1
      // Collisions raquettes
      if (this.ball.x < 20 && this.ball.y > this.playerY && this.ball.y < this.playerY + 80) { this.ball.dx *= -1.1; this.ball.x = 20 }
      if (this.ball.x > 580 && this.ball.y > this.cpuY && this.ball.y < this.cpuY + 80) { this.ball.dx *= -1.1; this.ball.x = 580 }
      // Points
      if (this.ball.x < 0) { this.scoreCpu++; this.resetBall(); this.checkWin() }
      if (this.ball.x > 600) { this.scorePlayer++; this.resetBall(); this.checkWin() }
    },
    checkWin() {
      // Fin de partie à 5 points par exemple (pour tester l'upload de score)
      if (this.scoreCpu >= 5 || this.scorePlayer >= 5) {
        this.paused = true
        cancelAnimationFrame(this.gameLoop)
        // Score calculé : différence positive si gagné
        let finalScore = (this.scorePlayer - this.scoreCpu) * 100
        if(finalScore < 0) finalScore = 0
        this.$emit('game-over', finalScore)
      }
    },
    resetBall() { this.ball = {x:300, y:200, dx:(Math.random()>0.5?4:-4), dy:4, size:10} },
    draw() { /* ... code draw existant ... */
      this.ctx.fillStyle = 'black'; this.ctx.fillRect(0,0,600,400)
      this.ctx.fillStyle = '#AA96DA'; this.ctx.fillRect(10, this.playerY, 10, 80); this.ctx.fillRect(580, this.cpuY, 10, 80)
      this.ctx.beginPath(); this.ctx.arc(this.ball.x, this.ball.y, 10, 0, Math.PI*2); this.ctx.fill()
    },
    loop() { if(this.paused) return; this.update(); this.draw(); this.gameLoop = requestAnimationFrame(this.loop) }
  }
}
</script>
<style scoped>.canvas-wrapper{position:relative;display:flex;justify-content:center;}canvas{border:4px solid #AA96DA;background:black;}.score-display{position:absolute;top:20px;color:white;font-family:'Press Start 2P';}.overlay{position:absolute;top:50%;color:#AA96DA;}</style>