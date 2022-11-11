<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated } from "vue";
import { getCurrentInstance } from "vue";
import { useUserStore } from "@/stores/user";
import router from "@/router";
import { useRoute } from "vue-router";
import Phaser from "phaser";
import io from "socket.io-client";

import config from "./game/config";
import Preloader from "./game/scenes/Preloader";
import MenuScene from "./game/scenes/MenuScene";
import WaitingRoom from "./game/scenes/WaitingRoom";
import DefaultGame from "./game/scenes/DefaultGame";
import CustomizableGame from "./game/scenes/CustomizableGame";
import CatPongGame from "./game/scenes/CatPongGame";
import type { Socket } from "engine.io-client";

let containerId: string;
let userStore;
let socket;
let gameInstance;
let activeRoomNames;
let error = false;
const data = {
  userId: 0,
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

window.addEventListener("beforeunload", async (e) => {
  console.log("BEFORE UNLOAAAAD");
  if (gameInstance !== undefined) {
    disconnectSockets();
    gameInstance.destroy();
  }
  if (socket !== undefined) {
    socket.disconnect();
  }
});

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add("Preloader", Preloader);
    this.scene.add("MenuScene", MenuScene);
    this.scene.add("WaitinRoom", WaitingRoom);
    this.scene.add("DefaultGame", DefaultGame);
    this.scene.add("CustomizableGame", CustomizableGame);
    this.scene.add("CatPongGame", CatPongGame);
    this.scene.start("Preloader", data);
  }
}

onMounted(() => {
  //alert("MOUNT");
  containerId = "game-container";
  userStore = useUserStore();
  data.userId = userStore.user.id
  console.log(typeof userStore);
  socket = io("http://localhost:3000/game");
  console.log(typeof socket);
  const route = useRoute();
  const str = route.query.challenge;

  const level = route.params.ourGames;
  console.log('level "' + level + '"');
  const key = route.params.id;

  socket.emit("getActiveRoomNames", { type: 2 });

  socket.on("getActiveRoomNames", (payload) => {
    activeRoomNames = payload.roomNames;
    const array = Object.keys(activeRoomNames);
    console.log(activeRoomNames);
    console.log(typeof activeRoomNames);

    // A CHALLENGE HAS BEEN ACCEPTED
    if (str) {
      data.challenge = true;
      const challenge = JSON.parse(str);
      console.log("CHALLENGE " + challenge);
      data.challengeInfo.challenger = challenge.challenger;
      data.challengeInfo.level = ++challenge.level;
      data.challengeInfo.challenged = challenge.challenged;
    } else if (level !== "") {
      // NO CHALLENGE
      console.log("KEY");
      console.log(key);
      if (level === "pong" || level === "catPong" || level === "customizable") {
        data.level = level;
        console.log("LEVEL");
        console.log(data.level);
        if (key) {
          if (array.includes(key)) {
            console.log("key coorect");
            data.key = key;
            //data.level = activeRoomNames[key].level;
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
      console.log("DATA");
      console.log(data);
      gameInstance = new Game();
	  console.log("GI")
	  console.log(typeof gameInstance);
    }
  });
});

onBeforeUnmount(() => {
  //alert("UNMOUNT");
  console.log(gameInstance);
  if (gameInstance) {
    disconnectSockets();
    gameInstance.destroy();
  }
  if (socket) {
    socket.disconnect();
  }
});

function disconnectSockets() {
  if (gameInstance) {
    console.log(gameInstance.scene.scenes);
    let roomId: number;
    let level: number;
    const defScene = gameInstance.scene.scenes[3].socket;
    if (defScene !== undefined) {
      roomId = gameInstance.scene.scenes[3].roomName;
      level = gameInstance.scene.scenes[3].level;
      console.log("ROOM ID " + roomId + " LEVEL " + level);
      defScene.disconnect();
    }
    const custScene = gameInstance.scene.scenes[4].socket;
    if (custScene !== undefined) {
      roomId = gameInstance.scene.scenes[4].roomId;
      level = gameInstance.scene.scenes[4].level;
      console.log("ROOM ID " + roomId + " LEVEL " + level);
      custScene.disconnect();
    }
    const catScene = gameInstance.scene.scenes[5].socket;
    if (catScene !== undefined) {
      roomId = gameInstance.scene.scenes[5].roomId;
      level = gameInstance.scene.scenes[5].level;
      console.log("ROOM ID " + roomId + " LEVEL " + level);
      catScene.disconnect();
    }
  }
}
</script>

<template>
  <div :id="containerId" />
</template>
