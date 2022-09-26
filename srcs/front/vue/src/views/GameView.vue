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
            x: 640 / 2 + 10 / 2,
            y: 480 / 2 - 10 / 2,
          },
          dir: {
            x: 0,
            y: 0,
          },
          rad: 10,
          speed: 0,
        },
        player: [
          {
            paddle: {
              x: 2,
              y: 480 / 2 - 50,
              w: 10,
              h: 100,
            },
          },
          {
            paddle: {
              x: 640 - 2,
              y: 480 / 2 - 50,
              w: 10,
              h: 100,
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

    /*  this.drawBall(
        this.gameState.ball.pos.x,
        this.gameState.ball.pos.y,
        this.gameState.ball.rad,
        0,
        2 * Math.PI
      );

      this.drawRect(
        this.gameState.player[0].paddle.x,
        this.gameState.player[0].paddle.y,
        this.gameState.player[0].paddle.w,
        this.gameState.player[0].paddle.h
      );*/

      window.addEventListener("keydown", this.keydown);
      this.gameActive = true;
    },
    keydown(e) {
      if (this.gameActive) this.socket.emit("keydown", e.keyCode);
    },
    drawBall(x, y, rad, sa, ea) {
      this.context.beginPath();
      this.context.fillStyle = "red";
      this.context.arc(x, y, rad, sa, ea);
      this.context.strokeStyle = "black";
      this.context.strokeWidth = 4;
      this.context.closePath();
      this.context.fill();
      this.context.stroke();
    },
    drawRect(x, y, w, h) {
      this.context.beginPath();
      //this.context.fillStyle = "black";
      this.context.rect(x, y, w, h);
      this.context.closePath();
      this.context.fill();
    },
    clearRect() {
      this.context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
    },
    paintGame(state) {
      this.clearRect();
      const ballx = state.ball.pos.x;
      this.drawBall(
        ballx,
        state.ball.pos.y,
        this.gameState.ball.rad,
        0,
        2 * Math.PI,
        SNAKE_COLOR
      );
      this.paintPaddle(state.player[0]);
    },
    paintPaddle(player) {
     this.drawRect(
        player.paddle.x,
        player.paddle.y,
        player.paddle.w,
        player.paddle.h
      );

    },
    handleInit(number) {
      this.playerNumber = number;
    },
    handleGameState(gameState) {
      if (!this.gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
      //console.log(gameState);
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
  background-color: blue;
  border: 1px solid black;
}
</style>
