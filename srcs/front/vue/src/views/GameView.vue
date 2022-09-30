<script>
import io from "socket.io-client";
//import { reactive } from "vue";
import { Ball, Player } from "@/components/game";

const WIDTH = 0;
const HEIGHT = 0;

const BALL_COLOR = "#c2c2c2";
const BALL_SIZE = 10;

/*const fps = 60;
const frameInterval = 1000 / fps;
const lasTime = new Date().getTime();*/

/*const styleCanvas = {
    width: "640",
    height: "480"
} */

export default {
  name: "GamePong",
  data() {
    return {
      socket: null,
      playerNumber: "",
      gameActive: false,
      context: {},
      gameCode: "",
      score: {
        playerOne: "0",
        playerTwo: "0",
      },
      canvasStyle: {
        width: "640",
        height: "480",
      },
      /*  gameState: {
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
    this.socket.on("quitGame", this.handleQuitGame);
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
      this.drawField();
      this.drawScore();
      this.drawBall(
        this.WIDTH / 2,
        this.HEIGHT / 2,
        BALL_SIZE,
        0,
        2 * Math.PI,
        BALL_COLOR
      );
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
    drawField() {
      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      this.context.strokeStyle = "white";
      this.context.beginPath();
      this.context.moveTo(this.WIDTH / 2, 0);
      this.context.lineTo(this.WIDTH / 2, this.HEIGHT);
      this.context.stroke();
    },
    drawScore() {
      this.context.font = "30px Arial";
      //this.context.fillStyle = "white";
      this.context.textAlign = "center";
      this.context.strokeText(
        `${this.score.playerTwo}    ${this.score.playerOne}`,
        this.WIDTH / 2,
        this.HEIGHT / 12
      );
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
      this.context.fillStyle = "white";
      this.context.fillRect(x, y, w, h);
      this.context.closePath();
      this.context.fill();
    },
    clearRect() {
      this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    },
    paintGame(state) {
      //const now = new Date().getTime();
      //const elapsed = now - lasTime;
      //if (elapsed > frameInterval) {
      this.clearRect();
      this.drawField();
      this.drawScore();
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
      //}
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
      this.score.playerOne = gameState.players[0].match_score;
      this.score.playerTwo = gameState.players[1].match_score;
      requestAnimationFrame(() => this.paintGame(gameState));
    },
    handleGameOver(data) {
      if (!this.gameActive) {
        return;
      }
      data = JSON.parse(data);
      this.score.playerOne = data.state.players[0].match_score;
      this.score.playerTwo = data.state.players[1].match_score;
      this.drawField();
      this.drawScore();
      this.paintPaddle(data.state.players[0]);
      this.paintPaddle(data.state.players[1]);
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
      this.gameActive = false;
      this.reset();
      //this.socket.close();
      //alert("You have been disconnected !");
      //this.socket.delete("http://localhost:3000"); // ?????
    },
    reMatch() {
      if (this.gameActive) {
        return ;
      }
      this.socket.emit("reMatch", JSON.stringify(this.gameCode));
    },
    handleReMatch(msg) {
      this.gameActive = true;
      msg = JSON.parse(msg);
      console.log(msg);
    },
    quitGame() {
        this.socket.emit("quitGame", JSON.stringify(this.gameCode));
    },
    handleQuitGame(msg) {
        this.gameActive = false;
        this.reset();
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
        <canvas
          id="canvas"
          ref="canvas"
          v-bind:width="canvasStyle.width"
          v-bind:height="canvasStyle.height"
        ></canvas>
        <button type="submit" @click.prevent="reMatch">Re-Match !</button>
        <button type="submit" @click.prevent="quitGame">Quit</button>
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
