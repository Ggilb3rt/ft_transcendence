<!-- eslint-disable prettier/prettier -->
<script>
import io from "socket.io-client";
import { Ball, Player } from "@/components/game";

const WIDTH = 0;
const HEIGHT = 0;

const BALL_COLOR = "#c2c2c2";
const BALL_SIZE = 10;

export default {
  name: "GamePong",
  data() {
    return {
      socket: null,
      playerNumber: "",
      gameActive: false,
      context: {},
      gameCode: "",
      /*gameState: {
        ball: Ball,
        playerOne: Player,
        playerTwo: Player,
      },*/
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
    this.socket.on("disconnected", this.handleDisconnected);
    this.socket.on("reMatch", this.handleReMatch);
  },
  mounted() {
    this.context = this.$refs.canvas.getContext("2d");
  },
  unmounted() {
    this.socket.close();
  },
  methods: {
    init() {
      this.WIDTH = this.$refs.canvas.width;
      this.HEIGHT = this.$refs.canvas.height;
      this.$refs.initialScreen.style.display = "none";
      this.$refs.gameScreen.style.display = "block";
      window.addEventListener("keydown", this.keydown);
      window.addEventListener("keyup", this.keyup);
      this.gameActive = true;
    },
    keydown(e) {
      if (this.gameActive) this.socket.emit("keydown", e.keyCode);
    },
    keyup(e) {
      if (this.gameActive) this.socket.emit("keyup", e.keyCode);
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
      this.context.rect(x, y, w, h);
      this.context.closePath();
      this.context.fill();
    },
    clearRect() {
      this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    },
    paintGame(state) {
      this.clearRect();
      //const ballx = state.ball.posx;
      this.drawBall(
        state.ball.posx,
        state.ball.posy,
        BALL_SIZE,
        0,
        2 * Math.PI,
        BALL_COLOR
      );
      this.paintPaddle(state.players[0]);
      this.paintPaddle(state.players[1]);
    },
    paintPaddle(player) {
      this.drawRect(player.posx, player.posy, player.width, player.height);
    },
    handleInit(number) {
      this.playerNumber = number;
    },
    handleGameState(gameState) {
      if (!this.gameActive) {
        return;
      }
      gameState = JSON.parse(gameState);
      
      this.gameCode = gameState.roomName;
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
      //this.gameCode = "";
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
    handleDisconnected() {
        console.log("You have been disconnected");
        //this.socket.close();
        //alert("You have been disconnected !");
        //this.socket.delete("http://localhost:3000"); // ?????
    },
    reMatch() {
        if (this.gameActive) {
            return ;
        }
        this.gameActive = true;
        this.socket.emit("reMatch", JSON.stringify(this.gameCode));
    },
    handleReMatch(msg){
        msg = JSON.parse(msg);
        console.log(msg);
    }
  },
};
</script>

<template>
  <div class="container h-100">
    <div id="initalScreen" ref="initialScreen" class="h-100">
      <div class="d-flex flex-column align-items-center justify-content-center h-100">
        <h1>Multiplayer Pong</h1>
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
        <button type="submit" @click.prevent="reMatch">Re-Match !</button>
      </div>
    </div>
  </div>
</template>

<style>
#gameScreen {
  display: none;
}

#canvas {
  background-color: black;
  border: 1px solid black;
}
</style>
