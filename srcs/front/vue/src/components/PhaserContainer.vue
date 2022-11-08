<script setup lang="ts">
import { onBeforeUnmount, onMounted, onUnmounted, onUpdated } from "vue";
//import { useUsersStore } from '@/stores/users';
import { useUserStore } from "@/stores/user";
//import { useStatusStore } from "@/stores/status";
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
//const usersStatusStore = useStatusStore();
const type = "general"
const socket = io("http://localhost:3000/game");
let gameInstance;
let activeRoomNames = {};
let key: string;

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add("MenuScene", MenuScene);
    this.scene.add("WaitinRoom", WaitingRoom);
    this.scene.add("DefaultGame", DefaultGame);
    this.scene.add("CustomizableGame", CustomizableGame);
    this.scene.add("CatPongGame", CatPongGame);
    this.scene.add("Preloader", Preloader);
    this.scene.start("Preloader", { userId: userStore.user.id, level: key });
  }
}

onMounted(() => {
	const route = useRoute();
  //console.log("ROOUTE");
  //console.log(route);
  //console.log("QUERY");
  //console.log(route.query.test);
  key = route.params.ourGames;
  socket.emit("getActiveRoomNames");
  socket.on("getActiveRoomNames", (data) => {
    activeRoomNames = data.roomNames;
  });

  if (
    key != "pong" &&
    key != "catPong" &&
    key != "customizable" &&
    key in activeRoomNames === false
  ) {
    router.replace({ path: "/game" });
    key = "";
  }

  console.log("KEY PARAM URL : " + key);
  gameInstance = new Game();
});

onUpdated(() => {
  //console.log("UNLOADDDDDDD");
  router.push("/game");
  
});

onBeforeUnmount(() => {
  let s = gameInstance.scene.scenes[2].socket;
  if (s !== null && s !== undefined) {
    console.log("default socket");
    console.log(s);
    s.disconnect();
  }
  s = gameInstance.scene.scenes[3].socket;
  if (s !== null && s !== undefined) {
    console.log("custom socket");
    console.log(s);
    s.disconnect();
  }
  s = gameInstance.scene.scenes[4].socket;
  if (s !== null && s !== undefined) {
    console.log("catpong socket");
    console.log(s);
    s.disconnect();
  }
  socket.disconnect();


});
</script>

<template>
  <div :id="containerId" />
</template>
