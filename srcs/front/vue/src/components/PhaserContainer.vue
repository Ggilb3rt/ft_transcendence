<script setup lang="ts">
import { onBeforeUnmount, onMounted, onRenderTriggered } from "vue";
import { useUserStore } from "@/stores/user";
import { useUsersStore } from "@/stores/users";
import { useStatusStore } from "@/stores/status";
import { useRoute } from "vue-router";
import Phaser from "phaser";
import io, { Socket } from "socket.io-client";
import router from "@/router";

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
const socket = io("http://localhost:3000/game", {
  query: {
    type: "phaserContainerSocket",
  },
});
const urlQuery = route.query.challenge;
const urlLevel = String(route.params.level);
const urlType = Number(route.params.type);
const urlRoomId = String(route.params.roomId);
const validLevels = ["pong", "catPong", "customizable"];
let activeRoomNames: string[];
let activeRooms;
let gameInstance: Game;
const data = {
  userId,
  spectator: false,
  challenge: false,
  challengeId: "",
  key: "",
  level: "",
  vueSocket: socket,
};

/*socket.emit("isUserInGame", { userId });
socket.on("isUserInGame", (data) => {
  if (data.userId === userId) {
    inGame = data.bool;
  } else {
    oppInGame = data.bool;
  }
});*/

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
  statusStore.changeChallengeForIngame(false);
  disconnectGameSocket();
  destroyGame();
  if (socket) {
    socket.disconnect();
  }
});

function initGame() {
  socket.emit("getActiveRoomNames", { type: 2 });
  socket.on("getActiveRoomNames", (payload) => {
	activeRooms = payload.roomNames;
    activeRoomNames = Object.keys(payload.roomNames);
	console.log(activeRooms);

    console.log("TYPE " + urlType);
    console.log("LEVEL " + urlLevel);
    console.log("URL ROOMID " + urlRoomId);

    if (isValidURL()) {
      launchGame();
    } else {
      router.replace("/");
    }
  });
}

function isValidURL(): boolean {
  if (urlType < 0 || urlType > 3) {
    return false;
  }

  if (!validLevels.includes(urlLevel)) {
    return false;
  }

  if (urlType == undefined && urlLevel == undefined) {
    return false;
  }

  if (urlType === 1) {
    data.level = urlLevel;
    if (urlRoomId) {
      return false;
    }
  } else if (urlType === 2) {
    if (urlRoomId != undefined && !activeRoomNames.includes(urlRoomId)) {
      return false;
    }
    data.spectator = true;
    data.level = urlLevel;
    data.key = urlRoomId;
  } else if (urlType === 3) {
    console.log("URL ROOM ID " + urlRoomId);
    console.log("ACTIVE ROOM NAMES " + activeRoomNames);
    if (urlRoomId != undefined && activeRoomNames.includes(urlRoomId)) {
      if (
        activeRooms[urlRoomId].p1 != userId &&
        activeRooms[urlRoomId].p2 != userId
      ) {
        data.spectator = true;
        data.level = urlLevel;
        data.key = urlRoomId;
      } else {
        data.challenge = true;
        data.challengeId = urlRoomId;
        data.level = urlLevel;
      }
    } else {
      return false;
    }
  }
  return true;
}

function isValidGame(): boolean {
  if (!urlLevel) {
    return false;
  }

  if (validLevels.includes(urlLevel)) {
    data.level = urlLevel;
    if (urlRoomId) {
      if (urlType === 2 && activeRoomNames.includes(urlRoomId)) {
        data.key = urlRoomId;
        data.spectator = true;
      } else {
        return false;
      }
    }
    return true;
  }
  return false;
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
  statusStore.changeCurrentUserStatus("inGame", userId);
  statusStore.changeChallengeForIngame(true);
  gameInstance = new Game();
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
</script>

<template>
  <div :id="containerId" />
</template>
