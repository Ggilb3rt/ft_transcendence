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
        player: [{
            paddle: {
                x: 2,
                y: (480 / 2) - 50,
                w: 10,
                h: 100,
            }
          }, {
            paddle: {
                x: 640 - 2,
                y: (480 / 2) - 50,
                w: 10,
                h: 100,
            }
          }]
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

      this.drawBall(
        this.gameState.ball.pos.x,
        this.gameState.ball.pos.y,
        this.gameState.ball.rad,
        0,
        2 * Math.PI
      );

    /*  this.drawPaddle(
        this.gameState.players[0].pos.x,
        this.gameState.players[0].pos.y,
        this.gameState.players[0].dim.w,
        this.gameState.players[0].dim.h,
        "black"
      );*/

    this.drawRect(this.gameState.player[0].paddle.x, this.gameState.player[0].paddle.y, this.gameState.player[0].paddle.w, this.gameState.player[0].paddle.h);


      window.addEventListener("keydown", this.keydown);
      this.gameActive = true;
    },
    keydown(e) {
      if (this.gameActive) this.socket.emit("keydown", e.keyCode);
    },
    drawPaddle(x, y, w, h, color) {
     /* this.context.beginPath();
      this.context.rect(x, y, w, h);
      this.context.fillStyle = color;
      this.context.strokeStyle = color;
      this.linedWith = 1;
      this.context.fillStyle = color;
      this.shadowBlur = 0;
      this.context.shadowcolor = "blue";
      this.context.strokeRect(x, y, w, h);
      this.context.fill();
      //this.contex.closePath();*/
      //this.canvas.clear();
      //this.context.circle(this.players[0].pos.x, this.$refs.canvas.height - this.players[0].dim.h, this.players[0].dim.h, this.players[0].dim.h );

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
     // this.context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
     //this.context.fillStyle = "white";
     //this.context.fillRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
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
      //this.drawRect(this.players[0].paddlex, this.$refs.canvas.height - this.players[0].paddleh, this.players[0].paddlew, this.players[0].paddleh);
       // this.drawRect(this.player.paddlex, this.$refs.canvas.height - this.player.paddleh, this.player.paddlew, this.player.paddleh);
   this.drawRect(this.gameState.player[0].paddle.x, this.gameState.player[0].paddle.y, this.gameState.player[0].paddle.w, this.gameState.player[0].paddle.h);

      //this.drawRect(state.players[0].pos.x, state.players[0].pos.y, state.players[0].dim.w, state.players[0].dim.h)
      //this.paintPlayer(state.players[0]);

      /*  const food = state.food;
      const gridsize = state.gridsize;
      const size = this.$refs.canvas.width / gridsize;
      const players = state.players;

      this.context.fillStyle = FOOD_COLOR;
      this.context.fillRect(food.x * size, food.y * size, size, size);

      this.paintPlayer(players[0], size, SNAKE_COLOR);
      this.paintPlayer(players[1], size, "red");*/
    },
    paintPlayer(playerState /*, size, color*/) {
      /*  const snake = playerState.snake;

      this.context.fillStyle = color;

      for (const cell of snake) {
        this.context.fillRect(cell.x * size, cell.y * size, size, size);
      }*/

    /*   this.drawPaddle(
        playerState.pos.x,
        playerState.pos.y,
        playerState.dim.w,
        playerState.dim.h,
        "black");*/
      //this.context.fillStyle = "black";
      //this.context.fillRect(playerState.pos.x, playerState.pos.y, playerState.dim.w, playerState.dim.h);
      /*    this.drawPaddle(
        this.gameState.players[0].pos.x,
        this.gameState.players[0].pos.y,
        this.gameState.players[0].dim.w,
        this.gameState.players[0].dim.h,
        "black");*/
    },
    handleInit(number) {
      this.playerNumber = number;
    },
    handleGameState(gameState) {
      if (!this.gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
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
