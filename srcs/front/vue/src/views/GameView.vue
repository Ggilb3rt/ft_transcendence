<script>
import GameComp from "@/components/GameComp.vue";
import io from "socket.io-client";

export default {
  name: "GamePong",
  components: {
    GameComp,
  },
  data() {
    return {
      socket: null,
      playerNumber: 0,
      gameActive: false, // Change le display (start new game ou play)
      startGame: false, // Devient true quand deux joueurs dans la meme room ready to play
      quit: false,
      gameCode: "",
    };
  },
  created() {
    this.socket = io("http://localhost:3000");

    this.socket.on("init", this.handleInit);
    this.socket.on("gameCode", this.handleGameCode);
    this.socket.on("unknownGame", this.handleUnknownGame);
    this.socket.on("disconnected", this.handleDisconnected);
    //this.socket.on("reMatch", this.handleReMatch);
    this.socket.on("quitGame", this.handleQuitGame);
    this.socket.on("totalPlayers", this.handleTotalPlayers);
  },
  unmounted() {
    this.socket.close();
  },
  methods: {
    handleInit(number) {
      console.log("handle init");
      this.playerNumber = number;
      if (this.playerNumber === 2) {
        this.startGame = true;
      }
      if (this.playerNumber !== 1 && this.playerNumber !== 2) {
        this.startGame = true;
      }
    },
    handleTotalPlayers(number) {
      this.totalPlayers = number;
      if (this.totalPlayers === 2) {
        this.startGame = true;
      }
    },
    handleGameCode(gameCode) {
      this.gameCode = gameCode;
      this.$refs.gameCodeDisplay.innerText = gameCode;
    },
    handleUnknownGame() {
      this.gameActive = false;
      this.reset();
      alert("Unknown game code");
    },
    newGame() {
      this.socket.emit("newGame");
      this.gameActive = true;
    },
    joinGame() {
      const code = this.gameCode;
      this.socket.emit("joinGame", code);
      this.gameActive = true;
    },
    reset() {
      this.playerNumber = null;
      this.gameCode = "";
      this.$refs.gameCodeDisplay.innerText = "";
    },
    handleDisconnected() {
      console.log("You have been disconnected");
      this.gameActive = false;
      this.reset();
      //this.socket.close();
      //alert("You have been disconnected !");
      //this.socket.delete("http://localhost:3000"); // ?????
    },
    /*reMatch() {
      console.log("rematch asked");
      //console.log(this.gameCode);
      //this.socket.emit("reMatch", JSON.stringify(this.gameCode));
      this.socket.emit("reMatch", { gameCode: this.gameCode });
    },
    handleReMatch(msg) {
      this.gameActive = true;
      msg = JSON.parse(msg);
      console.log(msg);
    },*/
    quitGame() {
      this.socket.emit("quitGame", JSON.stringify(this.gameCode));
    },
    handleQuitGame(msg) {
      this.gameActive = false;
      this.startGame = false;
      this.quit = true;
      this.reset();
      msg = JSON.parse(msg);
      console.log(msg);
    },
  },
};
</script>

<template>
  <div v-show="!gameActive">
    <h1>Multiplayer Pong</h1>
    <button type="submit" @click.prevent="newGame">Create New Game</button>
    <div>OR</div>
    <div class="form-group">
      <input v-model="gameCode" type="text" placeholder="Enter Game Code" />
      <button type="submit" @click.prevent="joinGame">Join Game</button>
    </div>
  </div>

  <div v-show="gameActive">
    <h1>THE GAME</h1>
    <h1>
      Your game code is:
      <span id="gameCodeDisplay" ref="gameCodeDisplay"></span>
    </h1>
    <GameComp
      :socket="this.socket"
      :playerNumber="this.playerNumber"
      :startGame="this.startGame"
      :gameCode="this.gameCode"
      :gameActive="this.gameActive"
      :quit="this.quit"
    />
    <!-- :score="this.score" -->
    <!-- <button type="submit" @click.prevent="reMatch">Re-Match !</button> -->
    <button type="submit" @click.prevent="quitGame">Quit</button>
  </div>
</template>

<style></style>
