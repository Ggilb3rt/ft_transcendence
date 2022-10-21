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
      level: 0,
      spectator: false,
    };
  },
  created() {
    this.socket = io("http://localhost:3000/game");

    this.socket.on("init", this.handleInit);
    this.socket.on("gameCode", this.handleGameCode);
    this.socket.on("unknownGame", this.handleUnknownGame);
    this.socket.on("disconnected", this.handleDisconnected);
    this.socket.on("quitGame", this.handleQuitGame);
    this.socket.on("totalPlayers", this.handleTotalPlayers);
    this.socket.on("newGame", this.handleNewGame);
  },
  unmounted() {
    this.socket.close();
  },
  methods: {
    handleInit(data) {
      console.log("handle init");
      this.playerNumber = data.playerNumber;
      this.gameCode = data.gameCode;
      if (this.playerNumber > 2) {
        console.log("hello");
        this.spectator = true;
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
    joinGame() {
      const code = this.gameCode;
      this.socket.emit("joinGame", code);
      this.gameActive = true;
    },
    handleDisconnected() {
      console.log("You have been disconnected");
      this.gameActive = false;
      this.reset();
      //this.socket.close();
      //alert("You have been disconnected !");
      //this.socket.delete("http://localhost:3000"); // ?????
    },
    quitGame() {
      this.socket.emit("quitGame", {
        gameCode: this.gameCode,
        playerNumber: this.playerNumber,
      });
    },
    handleQuitGame(msg) {
      this.playerNumber = 0;
      this.spectator = false;
      this.gameActive = false;
      this.startGame = false;
      this.quit = true;
      this.playerNumber = null;
      this.gameCode = "";
      //this.$refs.gameCodeDisplay.innerText = "";
      console.log(msg);
    },
    newGame(level) {
      console.log("LEVEL" + level);
      this.level = level;
      this.quit = false;
      this.socket.emit("newGame", { level: level });
      this.gameActive = true;
    },
    handleNewGame() {
      console.log("START GAME");
      this.startGame = true;
    },
  },
};
</script>

<template>
  <div v-show="!gameActive">
    <h1>Multiplayer Pong</h1>
    <h2>JOIN THE QUEUE FOR A SPECIFIC LEVEL</h2>
    <button type="submit" @click.prevent="newGame(1)">LEVEL 1</button>
    <button type="submit" @click.prevent="newGame(2)">LEVEL 2</button>
    <button type="submit" @click.prevent="newGame(3)">LEVEL 3</button>
    <div>OR</div>
    <div class="form-group">
      <input v-model="gameCode" type="text" placeholder="Enter Game Code" />
      <button type="submit" @click.prevent="joinGame">Join Game</button>
    </div>
  </div>

  <div v-show="gameActive">
    <h1>THE GAME</h1>
    <GameComp
      :socket="this.socket"
      :playerNumber="this.playerNumber"
      :startGame="this.startGame"
      :gameCode="this.gameCode"
      :gameActive="this.gameActive"
      :quit="this.quit"
      :level="this.level"
      :spectator="this.spectator"
    />
    <button type="submit" @click.prevent="quitGame">Quit</button>
  </div>
</template>

<style></style>
