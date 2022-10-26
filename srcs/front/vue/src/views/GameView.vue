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
    this.socket.on("newGame", this.handleNewGame);
    this.socket.on("createNewGame", this.handleCreateNewGame);
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
        this.gameCode = data.gameCode;
        this.spectator = true;
        this.startGame = true;
      }
    },
    handleGameCode(gameCode) {
      this.gameCode = gameCode;
      this.$refs.gameCodeDisplay.innerText = gameCode;
    },
    handleUnknownGame() {
      this.gameActive = false;
      //this.reset();
      this.gameCode = "";
      this.$refs.gameCodeDisplay.innerText = "";
      alert("Unknown game code");
    },
    watchGame() {
      const code = this.gameCode;
      this.quit = false;
      this.socket.emit("watchGame", code);
      this.gameActive = true;
    },
    handleDisconnected() {
      console.log("You have been disconnected");
      this.playerNumber = 0;
      this.spectator = false;
      this.gameActive = false;
      this.startGame = false;
      this.quit = true;
      this.playerNumber = null;
      this.gameCode = "";
      this.$refs.gameCodeDisplay.innerText = "";
      //this.reset();
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
      this.$refs.gameCodeDisplay.innerText = "";
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
    createNewGame(level) {
      console.log("Creating new game level ", level);
      this.level = level;
      this.quit = false;
      this.socket.emit("createNewGame", { level: level });
      this.gameActive = true;
    },
    handleCreateNewGame(gameCode) {
        this.gameCode = gameCode.gameCode;
        console.log("handle create new room " + gameCode.gameCode);
    },
    joinGameInvite() {
        console.log("Joining room invite");
        this.socket.emit("joinGame", { gameCode: this.gameCode });
        this.quit = false;
        this.gameActive = true;
    }
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
    <h2>OR WATCH SPECIFIC GAME</h2>
    <div class="form-group">
      <input
        ref="gameCodeDisplay"
        v-model="gameCode"
        type="text"
        placeholder="Enter Game Code"
      />
      <button type="submit" @click.prevent="watchGame">Watch Game</button>
    </div>
    <h2>OR CREATE NEW GAME (BEFORE INVITE)</h2>
    <button type="submit" @click.prevent="createNewGame(1)">LEVEL 1</button>
    <button type="submit" @click.prevent="createNewGame(2)">LEVEL 2</button>
    <button type="submit" @click.prevent="createNewGame(3)">LEVEL 3</button>
    <h2>OR JOIN NEW GAME (AFTER INVITE)</h2>
    <div class="form-group">
      <input
        ref="gameCodeDisplay"
        v-model="gameCode"
        type="text"
        placeholder="Enter Game Code"
      />
      <button type="submit" @click.prevent="joinGameInvite">Join Game</button>
    </div>
  </div>

  <div v-show="gameActive">
    <h1>THE GAME</h1>
    <div id="game">
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
    </div>
    <button type="submit" @click.prevent="quitGame">Quit</button>
  </div>
</template>

<style>
#game {
  width: 50vw;
  height: 100vh;
  place-items: center;
}

@media screen /*and (max-width: 1000px) */ {
  #game {
    width: 100vw;
    height: 50vh;
  }
}
</style>
