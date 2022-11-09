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
let socket;
let gameInstance = null;
let activeRoomNames = [];
let key: string;
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
    this.scene.start("Preloader", data);
  }
}

onMounted(() => {
  alert("MOUNT");
  socket = io("http://localhost:3000/game");
  const route = useRoute();
  const str = route.query.challenge;
  //console.log("QUERY");
  //console.log(str);

 console.log("GI MOUN");
  if (gameInstance) {
    console.log(gameInstance.scene.scenes);
  }

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
      console.log("level " + challenge.level);
      //data.challengeInfo.level = challenge.level;
      data.challengeInfo.level = 1;
      data.challengeInfo.challenged = challenge.challenged;
      // data.userId = userStore.user.id,
    } else {
      // NO CHALLENGE
      key = route.params.ourGames;
      //data.userId = userStore.user.id,
      if (
        key != "pong" &&
        key != "catPong" &&
        key != "customizable" &&
        activeRoomNames.includes(key) === false
      ) {
        console.log("wrong key");
        //key = "";
      } else {
        data.key = key;
        console.log("KEY");
        console.log(data.key);
      }
    }
    //router.replace({ path: "/game" });
    console.log("DATA");
    console.log(data);
    gameInstance = new Game();
  });

  //window.addEventListener('beforeunload', function() {
  //event.returnValue = 'Write something'
  //		 alert("UNMOUNT2");
  //    })
});

onUpdated(() => {
  alert("UPDATE");
  //disconnectSockets();
  //
  //console.log("HAHAH");
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
    //console.log(gameInstance.scene.scenes);
    //gameInstance.destroy();
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
    if (defScene !== undefined /*&& defScene !== null*//* && "socket" in defScene*/) {
      //defScene.socket.disconnect();
	  roomId = gameInstance.scene.scenes[3].roomName;
	  level = gameInstance.scene.scenes[3].level;
	  console.log("ROOM ID " + roomId + " LEVEL " + level);
	  //defScene.emit("quitGame", {roomName: roomId, level});
      defScene.disconnect();
	  //socket.emit("quitGame", {roomName: roomId, level: 0})
	  //router.replace({ path: "/game" }); 
	  //console.log("socket exists");
    }
    const custScene = gameInstance.scene.scenes[4].socket;
	console.log("CUST SCENE " + custScene);
    if (custScene !== undefined /*&& custScene !== null*//* && "socket" in custScene*/) {
      custScene.disconnect();
	  roomId = gameInstance.scene.scenes[3].roomId;
	  console.log(roomId);
	  socket.emit("quitGame", {roomName: roomId, level: 0})
    }
    const catScene = gameInstance.scene.scenes[5].socket;
    if (catScene !== undefined/* && catScene !== null*//* && "socket" in catScene*/) {
      catScene.disconnect();
	  roomId = gameInstance.scene.scenes[3].roomId;
	  console.log(roomId);
	  socket.emit("quitGame", {roomName: roomId, level: 0})
    }
  }
}
</script>

<template>
  <div :id="containerId" />
</template>
