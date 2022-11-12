<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useStatusStore } from "@/stores/status";
import router from "@/router";
import { useRoute } from "vue-router";
import Phaser from "phaser";
import io from "socket.io-client";

import config from "./game/config";
import Preloader from "./game/scenes/Preloader";
import WaitingRoom from "./game/scenes/WaitingRoom";
import GameScene from "./game/scenes/GameScene";

const containerId = "game-container";
//const socket = io("http://localhost:3000/game"/*, { autoConnect: false }*/);
let socket;
const userStore = useUserStore();
const statusStore = useStatusStore();
const route = useRoute();
const str = route.query.challenge;
const level = route.params.ourGames;
const key = route.params.id;
let activeRoomNames = {};
let error = false;
let gameInstance;
const data = {
  userId: userStore.user.id,
  spectator: false,
  challenge: false,
  key: "",
  level: "",
  challengeInfo: {
    challenger: "",
    level: 0,
    challenged: "",
  },
};

window.addEventListener("beforeunload", (e) => {
  disconnectGameSocket();
  destroyGame();
  if (socket) {
  socket.disconnect();
  }
});

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add("Preloader", Preloader);
    this.scene.add("WaitingRoom", WaitingRoom);
    this.scene.add("GameScene", GameScene);
    this.scene.start("Preloader", data);
  }
}

onMounted(() => {
  if (statusStore.status === "inGame" || statusStore.status === "challenged") {
    //socket.connect();
    socket = io("http://localhost:3000/game");
    socket.on("connect", launchGame);
  } else {
    //socket.disconnect();
    router.push("/");
  }
});

onBeforeUnmount(() => {
  disconnectGameSocket();
  destroyGame();
  destroyGame();
  if (socket) {
  socket.disconnect();
  }
});

function launchGame() {
  socket.emit("getActiveRoomNames", { type: 2 });

  socket.on("getActiveRoomNames", (payload) => {
    activeRoomNames = payload.roomNames;
    const array = Object.keys(activeRoomNames);

    // A CHALLENGE HAS BEEN ACCEPTED
    if (str) {
      data.challenge = true;
      const challenge = JSON.parse(str);
      data.challengeInfo.challenger = challenge.challenger;
      data.challengeInfo.level = Number(challenge.level);
      data.challengeInfo.challenged = challenge.challenged;
    } else if (level !== "") {
      // NO CHALLENGE
      if (level === "pong" || level === "catPong" || level === "customizable") {
        data.level = level;
        if (key) {
          if (array.includes(key)) {
            console.log("key coorect");
            data.key = key;
            data.spectator = true;
          } else {
            error = true;
            console.log("key incorrect");
            router.replace("/");
          }
        }
      } else {
        error = true;
        console.log("level incorrect");
        router.replace("/");
      }
    } else {
      error = true;
      console.log("/game direct access unauthorized");
      router.replace("/");
    }
    if (!error) {
      gameInstance = new Game();
    }
  });
}

function disconnectGameSocket() {
  if (gameInstance !== undefined) {
    gameInstance.scene.scenes[2].socket.disconnect();
  }
}

function destroyGame() {
  if (gameInstance !== undefined) {
    gameInstance.destroy();
  }
}
</script>

<template>
  <div :id="containerId" />
</template>
