<!-- eslint-disable prettier/prettier -->
<script>
import io from "socket.io-client";

const BG_COLOR = "#231f20";
const SNAKE_COLOR = "#c2c2c2";
const FOOD_COLOR = "#e66916";

export default {
  name: "GamePong",
  data() {
    return {
      socket: null,
      context: {},
      gameState: {
         player: {
            pos: {
             x: 3,
             y: 10,
            },
            vel: {
              x: 1,
              y: 0,
            },
            snake: [
                {x:1, y:10},
                {x:2, y:10},
                {x:3, y:10}
            ]
         },
         food: {
            x: 7,
            y: 7,
         },
         gridsize: 20,
      }
    };
  },
  created() {
    this.socket = io("http://localhost:3000");

    this.socket.on("init", this.handleInit);

    this.socket.on("gameState", this.handleGameState);

    this.socket.on("gameOver", this.handleGameOver);
  },
  mounted() {
    this.init();
    //this.paintGame(this.gameState);
  },
  methods: {
    init() {
      this.context = this.$refs.canvas.getContext("2d");
      this.context.fillStyle = BG_COLOR;
      this.context.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      window.addEventListener("keydown", this.keydown);    
    },
    keydown(e) {
        console.log(e.keyCode);
        this.socket.emit('keydown', e.keyCode);
    },
    paintGame(state) {
        this.context.fillStyle = BG_COLOR;
        this.context.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);

        const food = state.food;
        const gridsize = state.gridsize;
        const size = this.$refs.canvas.width / gridsize;
        const player = state.player;

        this.context.fillStyle = FOOD_COLOR;
        this.context.fillRect(food.x * size, food.y * size, size, size);

        this.paintPlayer(player, size, SNAKE_COLOR);
    },
    paintPlayer(playerState, size, color) {
        const snake = playerState.snake;

        this.context.fillStyle = color;

        for (const cell of snake) {
            this.context.fillRect(cell.x * size, cell.y * size, size, size);
        }
    },
    handleInit(msg) {
        console.log(msg);
    },
    handleGameState(gameState) {
        gameState = JSON.parse(gameState);
        requestAnimationFrame(() => this.paintGame(gameState))
    },
    handleGameOver() {
        alert("You lost !");
    }
  }
}

</script>

<template>
  <div id="gameScreen" class="h-100">
    <h1>THE GAME</h1>
    <div class="d-flex flex-column align-items-center justify-content-center h-100">
      <canvas
        ref="canvas"
        width="600"
        height="600"
        style="border: 1px solid black"
      ></canvas>
    </div>
  </div>
</template>

<style></style>
