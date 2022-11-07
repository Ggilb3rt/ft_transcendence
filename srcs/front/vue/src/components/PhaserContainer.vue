<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from "vue";
//import { useUsersStore } from '@/stores/users';
import { useUserStore } from "@/stores/user";
import { useStatusStore } from "@/stores/status";
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
const usersStatusStore = useStatusStore();
const socket = io("http://localhost:3000/game");
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
  console.log(route);
  key = route.params.ourGames;
  socket.emit("getActiveRoomNames");
  socket.on("getActiveRoomNames", (data) => {
    activeRoomNames = data.roomNames;
    //console.log("ACTIVE ROOM NAMES" + activeRoomNames);
	//console.log(typeof activeRoomNames);
  });

  if (
    key != "pong" &&
    key != "catPong" &&
    key != "customizable"
     && key in activeRoomNames === false
  ) {
    router.replace({ path: "/game" });
	key = "";
  }

  console.log("KEY PARAM URL : " + key);
  const gameInstance = new Game();
});

onUpdated(() => {
  console.log("UNLOADDDDDDD");
  router.push("/game");
});
/*
async function getActiveGames() {
  try {
    const response = await fetch(`http://localhost:3000/gamepage/activegames`, {
      credentials: "include",
	});
	let data;
    console.log("fetching");
    if (response.status >= 200 && response.status < 300) {
      data = await response.json();
	} else {
      throw new Error(response.statusText);
    }
    if (data) {
      console.log("DATA");
      console.log(data);
    }
  } catch (error: any) {
    userStore.error = error.body;
  }
}*/
</script>

<template>
  <div :id="containerId" />
</template>
