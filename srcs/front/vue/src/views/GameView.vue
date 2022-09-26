<!-- eslint-disable prettier/prettier -->
<script>
import io from "socket.io-client";

const BG_COLOR = "#231f20";
const SNAKE_COLOR = "#c2c2c2";
const FOOD_COLOR = "#e66916";
const BALL_SIZE = 20;

export default {
  name: "GamePong",
  data() {
    return {
      socket: null,
      playerNumber: "",
      gameActive: false,
      context: {},
      gameCode: "",
      gameState: {
        ball: {
          pos: {
            x: 0,
            y: 0,
          },
          speed: {
            x: 4,
            y: 6,
          },
          size: 20,
        },
        players: [
          {
            pos: {
              x: 0,
              y: 10,
            },
            speed: {
              x: 0,
              y: 0,
            },
          },
          {
            pos: {
              x: 0,
              y: 10,
            },
            speed: {
              x: 0,
              y: 0,
            },
          },
        ],
      },
    };
  },
  created() {
    this.socket = io("http://localhost:3000");

    this.socket.on("init", this.handleInit);
    this.socket.on("gameState", this.handleGameState);
    this.socket.on("gameOver", this.handleGameOver);
    this.socket.on("gameCode", this.handleGameCode);
    this.socket.on("unknownGame", this.handleUnknownGame);
    this.socket.on("tooManyPlayers", this.handleTooManyPlayers);
  },
  mounted() {
    this.context = this.$refs.canvas.getContext("2d");
    //this.init();
    //this.paintGame(this.gameState);
  },
  methods: {
    init() {
      this.$refs.initialScreen.style.display = "none";
      this.$refs.gameScreen.style.display = "block";

      // Draw & fill the background
      //this.colorRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height, BG_COLOR);
      // Draw ball
      this.colorRect(
        this.gameState.ball.pos.x,
        this.gameState.ball.pos.y,
        this.gameState.ball.size,
        this.gameState.ball.size,
        FOOD_COLOR
      );
      //  this.ballMove();
      //this.context.fillStyle = BG_COLOR;
      //this.context.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      //window.addEventListener("keydown", this.keydown);
      this.gameActive = true;
    },
    keydown(e) {
      //console.log(e.keyCode);
      if (this.gameActive) this.socket.emit("keydown", e.keyCode);
    },
    colorRect(x, y, h, w, color) {
      this.context.fillStyle = color;
      this.context.fillRect(x, y, h, w);
    },
    paintGame(state) {
      //this.context.fillStyle = BG_COLOR;
      //this.context.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
        // Draw & fill the background
      //this.colorRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height, BG_COLOR);
      // Draw ball
      /*this.colorRect(
        this.gameState.ball.pos.x,
        this.gameState.ball.pos.y,
        this.gameState.ball.size,
        this.gameState.ball.size,
        FOOD_COLOR
      );*/

        const ballx = state.ball.pos.x;
        const size = this.$refs.canvas.width / this.gameState.ball.size;
        this.context.fillStyle = FOOD_COLOR;
        this.context.fillRect(ballx * size, 0, size, size);


      /*  const food = state.food;
      const gridsize = state.gridsize;
      const size = this.$refs.canvas.width / gridsize;
      const players = state.players;

      this.context.fillStyle = FOOD_COLOR;
      this.context.fillRect(food.x * size, food.y * size, size, size);

      this.paintPlayer(players[0], size, SNAKE_COLOR);
      this.paintPlayer(players[1], size, "red");*/
    },
    /*paintPlayer(playerState, size, color) {
      const snake = playerState.snake;

      this.context.fillStyle = color;

      for (const cell of snake) {
        this.context.fillRect(cell.x * size, cell.y * size, size, size);
      }
    },*/
    handleInit(number) {
      this.playerNumber = number;
    },
    handleGameState(gameState) {
      if (!this.gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
      console.log(gameState);
      requestAnimationFrame(() => this.paintGame(gameState));
    },
    handleGameOver(data) {
      if (!this.gameActive) {
        return;
      }
      data = JSON.parse(data);
      if (data.winner === this.playerNumber) {
        //alert("You win !");
        console.log("You win !");
      } else {
        console.log("You lose !");
        //alert("You lost !");
      }
      this.gameActive = false;
    },
    handleGameCode(gameCode) {
      this.$refs.gameCodeDisplay.innerText = gameCode;
    },
    handleUnknownGame() {
      this.reset();
      alert("Unknown game code");
    },
    handleTooManyPlayers() {
      this.reset();
      alert("This game is already in progress");
    },
    newGame() {
      this.socket.emit("newGame");
      this.init();
    },
    joinGame() {
      const code = this.gameCode;
      this.gameCode = "";
      this.socket.emit("joinGame", code);
      this.init();
    },
    reset() {
      this.playerNumber = null;
      this.gameCode = "";
      this.$refs.gameCodeDisplay.innerText = "";
      this.$refs.initialScreen.style.display = "block";
      this.$refs.gameScreen.style.display = "none";
    },
    /*ballMove() {
      this.gameState.ball.pos.x += this.gameState.ball.speed.x;
      //this.gameState.ball.pos.y += this.gameState.ball.speed.y;
    },*/
  },
};
</script>

<template>
  <div class="container h-100">
    <div id="initalScreen" ref="initialScreen" class="h-100">
      <div class="d-flex flex-column align-items-center justify-content-center h-100">
        <h1>Multiplayer Snake</h1>
        <button type="submit" @click.prevent="newGame">Create New Game</button>
        <div>OR</div>
        <div class="form-group">
          <input v-model="gameCode" type="text" placeholder="Enter Game Code" />
          <button type="submit" @click.prevent="joinGame">Join Game</button>
        </div>
      </div>
    </div>

    <div id="gameScreen" ref="gameScreen" class="h-100">
      <h1>THE GAME</h1>
      <div class="d-flex flex-column align-items-center justify-content-center h-100">
        <h1>
          Your game code is:
          <span id="gameCodeDisplay" ref="gameCodeDisplay"></span>
        </h1>
        <canvas id="canvas" ref="canvas" width="640" height="480"></canvas>
      </div>
    </div>
  </div>
</template>

<style>
#gameScreen {
  display: none;
}

#canvas {
  /*background-color: black;*/
  border: 1px solid black;
}
</style>
