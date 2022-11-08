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
import { anyTypeAnnotation } from "@babel/types";

const containerId = "game-container";
const userStore = useUserStore();
//const usersStatusStore = useStatusStore();
//let socket = io("http://localhost:3000/game");
let gameInstance = null;
let activeRoomNames = [];
let key: any;
//let challenge = {};
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
    // this.scene.start("Preloader", { userId: userStore.user.id, level: key });
    this.scene.start("Preloader", data);
  }
}

onMounted(() => {
  const route = useRoute();
  const str = route.query.challenge;
  //console.log("QUERY");
  //console.log(str);

  //socket.emit("getActiveRoomNames");

  //socket.on("getActiveRoomNames", (payload) => {
  //  activeRoomNames = payload.roomNames;
    //console.log(activeRoomNames);

    // A CHALLENGE HAS BEEN ACCEPTED
    if (str) {
      data.challenge = true;
      const challenge = JSON.parse(str);
      console.log("CHALLENGE " + challenge);
      data.challengeInfo.challenger = challenge.challenger;
      console.log("level " + challenge.level);
      //data.challengeInfo.level = challenge.level;
      data.challengeInfo.level = 1;
      data.challengeInfo.challenged = challenge.challenged;
    } else {
      // NO CHALLENGE
      key = route.params.ourGames;
      if (
        key != "pong" &&
        key != "catPong" &&
        key != "customizable"// &&
       // activeRoomNames.includes(key) === false
      ) {
        console.log("wrong key");
        //key = "";
      } else {
        data.level = key;
        console.log("KEY");
        console.log(data.key);
      }
    }
    router.replace({ path: "/game" });
    console.log("DATA");
    console.log(data);
    gameInstance = new Game();
 // });
});

onUpdated(() => {
  //disconnectSockets();
  router.replace({ path: "/game" });
  //console.log("HAHAH");
  //router.push("/game");
  const defScene = gameInstance.scene.scenes[3];
  if (defScene != undefined && defScene != null && "socket" in defScene) {
    //defScene.socket.disconnect();
	defScene.socket.disconnect();
    //console.log("socket exists");
  }
  const custScene = gameInstance.scene.scenes[4];
  if (custScene != undefined && custScene != null && "socket" in custScene) {
    custScene.socket.disconnect();
  }
  const catScene = gameInstance.scene.scenes[5];
  if (catScene != undefined && catScene != null &&"socket" in catScene) {
    catScene.socket.disconnect();
  }
  //if (socket) {
  //  socket.disconnect();
 // }
});

onBeforeUnmount(() => {
	console.log(gameInstance.scene.scenes[3]);
	const defScene = gameInstance.scene.scenes[3];
  if (defScene != undefined && defScene != null && "socket" in defScene) {
    //defScene.socket.disconnect();
	defScene.socket.disconnect();
    //console.log("socket exists");
  }
  const custScene = gameInstance.scene.scenes[4];
  if (custScene != undefined && custScene != null && "socket" in custScene) {
    custScene.socket.disconnect();
  }
  const catScene = gameInstance.scene.scenes[5];
  if (catScene != undefined && catScene != null &&"socket" in catScene) {
    catScene.socket.disconnect();
  }
  if (socket) {
    socket.disconnect();
  }
});
</script>

<template>
  <div :id="containerId" />
</template>
