<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUpdated } from "vue";
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

const containerId = "game-container";
const userStore = useUserStore();
let socket;
let gameInstance = null;
let activeRoomNames = [];
let key: string;
const data = {
  userId: userStore.user.id,
  spectator: false,
  challenge: false,
  level: "",
  challengeInfo: {
    challenger: "",
    level: 0,
    challenged: "",
  },
};

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
  alert("MOUNT");
  socket = io("http://localhost:3000/game");
  const route = useRoute();
  const str = route.query.challenge;

  socket.emit("getActiveRoomNames");

  socket.on("getActiveRoomNames", (payload) => {
    activeRoomNames = payload.roomNames;
    console.log(activeRoomNames);

    // A CHALLENGE HAS BEEN ACCEPTED
    if (str) {
      data.challenge = true;
      const challenge = JSON.parse(str);
      console.log("CHALLENGE " + challenge);
      data.challengeInfo.challenger = challenge.challenger;
      data.challengeInfo.level = ++challenge.level;
      data.challengeInfo.challenged = challenge.challenged;
    } else {
      // NO CHALLENGE
      key = route.params.ourGames;
      if (
        key != "pong" &&
        key != "catPong" &&
        key != "customizable" //&&
        /*activeRoomNames.includes(key) === false*/
      ) {
        console.log("wrong key");
        key = "";
      } else {
        data.level = key;
        console.log("KEY");
        console.log(data.level);
      }
    }
    //router.replace({ path: "/game" });
    console.log("DATA");
    console.log(data);
    gameInstance = new Game();
  });
});

onUpdated(() => {
  alert("UPDATE");
  if (gameInstance) {
    disconnectSockets();
    //gameInstance.destroy();
  }
  //router.replace({path: "/game"});
});

onBeforeUnmount(() => {
  alert("UNMOUNT");
  if (gameInstance) {
    console.log("GI UN");
    disconnectSockets();
    gameInstance.destroy();
  }
  if (socket) {
    socket.disconnect();
  }
});

function disconnectSockets() {
  console.log("GAME INSTANCE UNM " + gameInstance);
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
