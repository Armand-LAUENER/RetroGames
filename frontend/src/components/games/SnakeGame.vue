<template>
  <div class="canvas-wrapper">
    <canvas ref="canvas" width="600" height="400"></canvas>
    <div v-if="gameOver" class="overlay">
      <h3>GAME OVER</h3>
      <p>SCORE: {{ score }}</p>
      <button @click="resetGame" class="pixel-button-small">RETRY</button>
    </div>
    <div class="score-display">SCORE: {{ score }}</div>
  </div>
</template>

<script>
export default {
  props: ['controls'], // Receives 'arrows', 'zqsd', or 'wasd'
  emits: ['game-over'],
  data() { return { ctx: null, grid: 20, snake: [], apple: {}, dx: 20, dy: 0, score: 0, gameLoop: null, gameOver: false, speed: 100 } },
  mounted() {
    this.ctx = this.$refs.canvas.getContext('2d')
    this.resetGame()
    window.addEventListener('keydown', this.handleKey)
  },
  beforeUnmount() {
    clearInterval(this.gameLoop)
    window.removeEventListener('keydown', this.handleKey)
  },
  methods: {
    resetGame() {
      this.snake = [{x: 160, y: 160}, {x: 140, y: 160}, {x: 120, y: 160}]
      this.score = 0; this.dx = this.grid; this.dy = 0; this.gameOver = false
      this.placeApple()
      clearInterval(this.gameLoop); this.gameLoop = setInterval(this.update, this.speed)
    },
    handleKey(e) {
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].indexOf(e.code) > -1) e.preventDefault();

      const key = e.key.toLowerCase()
      const code = e.code
      let move = ''

      // Control mapping logic
      if (this.controls === 'arrows') {
        if (code === 'ArrowLeft') move = 'left'
        if (code === 'ArrowUp') move = 'up'
        if (code === 'ArrowRight') move = 'right'
        if (code === 'ArrowDown') move = 'down'
      } else if (this.controls === 'zqsd') {
        if (key === 'q') move = 'left'
        if (key === 'z') move = 'up'
        if (key === 'd') move = 'right'
        if (key === 's') move = 'down'
      } else if (this.controls === 'wasd') {
        if (key === 'a') move = 'left'
        if (key === 'w') move = 'up'
        if (key === 'd') move = 'right'
        if (key === 's') move = 'down'
      }

      // Apply Movement (prevent reversing direction)
      if (move === 'left' && this.dx === 0) { this.dx = -this.grid; this.dy = 0 }
      if (move === 'up' && this.dy === 0) { this.dy = -this.grid; this.dx = 0 }
      if (move === 'right' && this.dx === 0) { this.dx = this.grid; this.dy = 0 }
      if (move === 'down' && this.dy === 0) { this.dy = this.grid; this.dx = 0 }
    },
    placeApple() {
      this.apple.x = Math.floor(Math.random() * (600 / this.grid)) * this.grid
      this.apple.y = Math.floor(Math.random() * (400 / this.grid)) * this.grid
    },
    update() {
      if (this.gameOver) return
      const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy }

      if (head.x < 0 || head.x >= 600 || head.y < 0 || head.y >= 400) { this.endGame(); return }
      for (let i = 0; i < this.snake.length; i++) {
        if (head.x === this.snake[i].x && head.y === this.snake[i].y) { this.endGame(); return }
      }
      this.snake.unshift(head)
      if (head.x === this.apple.x && head.y === this.apple.y) {
        this.score += 10; this.placeApple()
      } else { this.snake.pop() }
      this.draw()
    },
    draw() {
      this.ctx.fillStyle = '#000'; this.ctx.fillRect(0, 0, 600, 400)
      this.ctx.fillStyle = '#FF6B6B'; this.ctx.fillRect(this.apple.x, this.apple.y, this.grid-1, this.grid-1)
      this.ctx.fillStyle = '#4ECDC4'
      this.snake.forEach(part => this.ctx.fillRect(part.x, part.y, this.grid-1, this.grid-1))
    },
    endGame() {
      this.gameOver = true; clearInterval(this.gameLoop); this.$emit('game-over', this.score)
    }
  }
}
</script>
<style scoped>
.canvas-wrapper { position: relative; display: flex; justify-content: center; }
canvas { border: 4px solid #4ECDC4; background: black; max-width: 100%; }
.overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; background: rgba(0,0,0,0.8); padding: 20px; border: 2px solid white; }
.score-display { position: absolute; top: 10px; right: 20px; color: white; font-family: 'Press Start 2P'; }
</style>