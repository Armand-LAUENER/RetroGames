<template>
  <div class="canvas-wrapper">
    <canvas ref="canvas" width="240" height="400"></canvas>

    <div class="side-panel">
      <div class="score-box">
        <div class="label">SCORE</div>
        <div class="value">{{ score }}</div>
      </div>

      <div v-if="gameOver" class="game-over-msg">
        GAME OVER
      </div>

      <button v-if="gameOver" @click="resetGame" class="pixel-button-small restart-btn">
        RESTART
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TetrisGame',
  props: ['controls'],
  emits: ['game-over'],
  data() {
    return {
      ctx: null,
      grid: [],
      score: 0,
      gameOver: false,
      currentPiece: null,
      dropCounter: 0,
      dropInterval: 1000,
      lastTime: 0,
      animationId: null,
      // Piece colors (T, Z, S, O, I, L, J)
      colors: [
        null,
        '#FF0D72', // T
        '#0DC2FF', // I
        '#0DFF72', // S
        '#F538FF', // Z
        '#FF8E0D', // L
        '#FFE138', // O
        '#3877FF', // J
      ],
      pieces: 'ILJOTSZ'
    }
  },
  mounted() {
    this.ctx = this.$refs.canvas.getContext('2d')
    this.ctx.scale(20, 20) // Scale: 1 block = 20x20 pixels
    window.addEventListener('keydown', this.handleKey)
    this.resetGame()
  },
  beforeUnmount() {
    cancelAnimationFrame(this.animationId)
    window.removeEventListener('keydown', this.handleKey)
  },
  methods: {
    // --- Tetris Logic ---
    createMatrix(w, h) {
      const matrix = [];
      while (h--) {
        matrix.push(new Array(w).fill(0));
      }
      return matrix;
    },
    createPiece(type) {
      if (type === 'I') return [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
      if (type === 'L') return [[0, 2, 0], [0, 2, 0], [0, 2, 2]];
      if (type === 'J') return [[0, 3, 0], [0, 3, 0], [3, 3, 0]];
      if (type === 'O') return [[4, 4], [4, 4]];
      if (type === 'Z') return [[5, 5, 0], [0, 5, 5], [0, 0, 0]];
      if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
      if (type === 'T') return [[0, 7, 0], [7, 7, 7], [0, 0, 0]];
    },
    resetGame() {
      this.grid = this.createMatrix(12, 20)
      this.score = 0
      this.gameOver = false
      this.playerReset()
      this.update()
    },
    playerReset() {
      const type = this.pieces[this.pieces.length * Math.random() | 0]
      this.currentPiece = {
        matrix: this.createPiece(type),
        pos: {x: 5, y: 0}
      }
      // Immediate collision means Game Over
      if (this.collide(this.grid, this.currentPiece)) {
        this.gameOver = true
        cancelAnimationFrame(this.animationId)
        this.$emit('game-over', this.score)
      }
    },
    collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    },
    drawMatrix(matrix, offset) {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            this.ctx.fillStyle = this.colors[value];
            this.ctx.fillRect(x + offset.x, y + offset.y, 1, 1);

            // 3D relief effect
            this.ctx.lineWidth = 0.05;
            this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            this.ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
          }
        });
      });
    },
    merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            arena[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    },
    rotate(matrix, dir) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      if (dir > 0) matrix.forEach(row => row.reverse());
      else matrix.reverse();
    },
    playerDrop() {
      this.currentPiece.pos.y++;
      if (this.collide(this.grid, this.currentPiece)) {
        this.currentPiece.pos.y--;
        this.merge(this.grid, this.currentPiece);
        this.arenaSweep();
        this.playerReset();
      }
      this.dropCounter = 0;
    },
    playerMove(dir) {
      this.currentPiece.pos.x += dir;
      if (this.collide(this.grid, this.currentPiece)) {
        this.currentPiece.pos.x -= dir;
      }
    },
    playerRotate(dir) {
      const pos = this.currentPiece.pos.x;
      let offset = 1;
      this.rotate(this.currentPiece.matrix, dir);
      while (this.collide(this.grid, this.currentPiece)) {
        this.currentPiece.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > this.currentPiece.matrix[0].length) {
          this.rotate(this.currentPiece.matrix, -dir);
          this.currentPiece.pos.x = pos;
          return;
        }
      }
    },
    arenaSweep() {
      let rowCount = 1;
      outer: for (let y = this.grid.length - 1; y > 0; --y) {
        for (let x = 0; x < this.grid[y].length; ++x) {
          if (this.grid[y][x] === 0) {
            continue outer;
          }
        }
        const row = this.grid.splice(y, 1)[0].fill(0);
        this.grid.unshift(row);
        ++y;

        this.score += rowCount * 100;
        rowCount *= 2;
      }
    },
    update(time = 0) {
      if (this.gameOver) return;
      const deltaTime = time - this.lastTime;
      this.lastTime = time;
      this.dropCounter += deltaTime;
      if (this.dropCounter > this.dropInterval) {
        this.playerDrop();
      }
      this.draw();
      this.animationId = requestAnimationFrame(this.update);
    },
    draw() {
      // Black background
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);

      // Existing grid
      this.drawMatrix(this.grid, {x: 0, y: 0});
      // Current piece
      this.drawMatrix(this.currentPiece.matrix, this.currentPiece.pos);
    },

    // --- Input Handling ---
    handleKey(e) {
      if (this.gameOver) return

      const key = e.key.toLowerCase()
      const code = e.code
      let action = ''

      // Prevent scrolling
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(code)) e.preventDefault()

      // Mapping
      if (this.controls === 'arrows') {
        if (code === 'ArrowLeft') action = 'left'
        if (code === 'ArrowRight') action = 'right'
        if (code === 'ArrowDown') action = 'drop'
        if (code === 'ArrowUp') action = 'rotate'
      } else if (this.controls === 'zqsd') {
        if (key === 'q') action = 'left'
        if (key === 'd') action = 'right'
        if (key === 's') action = 'drop'
        if (key === 'z') action = 'rotate'
      } else if (this.controls === 'wasd') {
        if (key === 'a') action = 'left'
        if (key === 'd') action = 'right'
        if (key === 's') action = 'drop'
        if (key === 'w') action = 'rotate'
      }

      // Actions
      if (action === 'left') this.playerMove(-1)
      else if (action === 'right') this.playerMove(1)
      else if (action === 'drop') this.playerDrop()
      else if (action === 'rotate') this.playerRotate(1)
    }
  }
}
</script>

<style scoped>
.canvas-wrapper {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
}

canvas {
  border: 4px solid #FFE66D;
  background: black;
  box-shadow: 0 0 15px rgba(255, 230, 109, 0.2);
}

.side-panel {
  color: white;
  font-family: 'Press Start 2P', cursive;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.score-box {
  border: 2px solid #95E1D3;
  padding: 15px;
  background: rgba(0,0,0,0.5);
}

.score-box .label {
  color: #95E1D3;
  font-size: 0.7rem;
  margin-bottom: 5px;
}

.score-box .value {
  color: #FFE66D;
  font-size: 1rem;
}

.game-over-msg {
  color: #FF6B6B;
  animation: blink 1s infinite;
  font-size: 0.8rem;
  margin-top: 20px;
}

.restart-btn {
  background: #FFE66D;
  color: black;
}

@keyframes blink { 50% { opacity: 0; } }
</style>