<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useUsersStore } from "@/stores/users";
import { useStatusStore } from "@/stores/status";
import { useRoute } from "vue-router";
import Phaser from "phaser";
import io from "socket.io-client";
import router from "@/router";
import UserLink from "@/components/user/UserLink.vue";

import config from "./game/config";
import Preloader from "./game/scenes/Preloader";
import WaitingRoom from "./game/scenes/WaitingRoom";
import GameScene from "./game/scenes/GameScene";

const containerId = "game-container";
const userStore = useUserStore();
const usersStore = useUsersStore();
const statusStore = useStatusStore();
const userId = userStore.user.id;
const route = useRoute();
const socket = io("http://localhost:3000/game");
const urlQuery = route.query.challenge;
const urlLevel = String(route.params.level);
const urlType = Number(route.params.type);
const urlRoomId = String(route.params.roomId);
const validLevels = ["pong", "catPong", "customizable"];
let inGame = false;
let oppInGame = false;
//let error = false;
let activeRoomNames: string[];
let gameInstance: Game;
const data = {
  userId,
  spectator: false,
  challenge: false,
  challengeId: "",
  key: "",
  level: "",
  /*challengeInfo: {
    challenger: "",
    level: 0,
    challenged: "",
	challengeId:
  },*/
};

window.addEventListener("beforeunload", (e) => {
  disconnectGameSocket();
  destroyGame();
  if (socket) {
    socket.disconnect();
  }
  statusStore.changeCurrentUserStatus("available", userId);
});

socket.emit("isUserInGame", { userId });
socket.on("isUserInGame", (data) => {
  if (data.userId === userId) {
    inGame = data.bool;
  } else {
    oppInGame = data.bool;
  }
});

onMounted(() => {
  if (!urlLevel && !urlQuery) {
    alert("YOU ALREADY ARE IN A GAME/CANNOT ACCESS DIRECT");
    router.push("/");
  } else {
    initGame();
  }
});

onBeforeUnmount(() => {
  statusStore.changeCurrentUserStatus("available", userId);
  disconnectGameSocket();
  destroyGame();
  if (socket) {
    socket.disconnect();
  }
});

function initGame() {
  socket.emit("getActiveRoomNames", { type: 2 });
  socket.on("getActiveRoomNames", (payload) => {
    activeRoomNames = Object.keys(payload.roomNames);

	console.log("TYPE " + urlType);
	console.log("LEVEL " + urlLevel);
	console.log("URL ROOMID " + urlRoomId)

    if (isValidType() && isValidGame()/* && !error*/) {
      launchGame();
    } else {
      router.replace("/");
    }
  });
}

function isValidType(): boolean {
  if (urlType !== 1 && urlType !== 2 && urlType !== 3) {
    return false;
  }
  if (urlType === 2) {
	data.spectator = true;
  } else if (urlType === 3) {
	data.challenge = true;
	data.challengeId = urlRoomId;
  }
  //console.log("urlQUERY " + urlQuery);
  //const challenge = JSON.parse(String(urlQuery)); // A VERIF
  //console.log("challenge" + challenge.challenger);

  /*let opponent; 
  if (challenge.challenger === userId) {
	opponent = challenge.challenged;
  } else {
	opponent = challenge.challenger;
  }
  //const opponent = challenge.challenged;
  socket.emit("isUserInGame", { opponent });
  console.log("OPPINGAME " + oppInGame)
   if (!oppInGame) { // Si l'autre utilisateur n'est plus ingame, c'est que c'est un reload;
   	error = true;
   } else {*/
  //data.challenge = true;
  //data.challengeInfo.challenger = challenge.challenger;
  //data.challengeInfo.level = Number(challenge.level);
  //data.challengeInfo.challenged = challenge.challenged;
  //}

  //console.log("DATA CHALLENGE ");
  //console.log(data.challengeInfo);

  return true;
  /*data.challenge = true;
  data.challengeInfo.challenger = challenge.challenger;
  data.challengeInfo.level = Number(challenge.level);
  data.challengeInfo.challenged = challenge.challenged;
  return true;*/
}

function isValidGame(): boolean {
  if (!urlLevel) {
    return false;
  }

  if (validLevels.includes(urlLevel)) {
    data.level = urlLevel;
    /*if (urlRoomId) {
      if (activeRoomNames.includes(urlRoomId)) {
        data.key = urlRoomId;
        data.spectator = true;
      } else {
        error = true;
      }
    }*/
  }
  return true;
}

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add("Preloader", Preloader);
    this.scene.add("WaitingRoom", WaitingRoom);
    this.scene.add("GameScene", GameScene);
    this.scene.start("Preloader", data);
  }
}

function launchGame() {
  socket.emit("addUserId", { userId });
  statusStore.changeCurrentUserStatus("inGame", userId);
  socket.on("userAdded", () => {
    gameInstance = new Game();
  });
}

function disconnectGameSocket() {
  if (gameInstance !== undefined) {
    const gameSocket = gameInstance.scene.scenes[2].socket;
    if (gameSocket !== undefined) {
      gameSocket.disconnect();
    }
  }
}

function destroyGame() {
  if (gameInstance !== undefined) {
    gameInstance.destroy(false);
  }
}

function filterUsers(id: number) {
  console.log("USER LIST");
  console.log(usersStore.userList);
  usersStore.userList.forEach((user, i) => {
    console.log(usersStore.userList[i]);
    if (user.id === id) {
      console.log(usersStore.userList[i]);
      return usersStore.userList[i];
    }
  });
}
</script>

<template>
  <!-- <div id="player-info"> -->
    <!-- <p>hahahehe</p> -->
    <!-- <button id="haha" -->
    <!-- @click="filterUsers(1)" -->
    <!-- > -->
    <!-- Pong<br /></button> -->
    <!-- <UserLink :other-user=userId></UserLink> -->
  <!-- </div> -->
  <div :id="containerId" />
</template>
