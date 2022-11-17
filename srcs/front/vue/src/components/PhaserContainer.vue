<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useUsersStore } from "@/stores/users";
import { useStatusStore } from "@/stores/status";
import { useRoute } from "vue-router";
import Phaser from "phaser";
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
const socket = statusStore.socketGame;
const urlQuery = route.query.challenge;
const urlLevel = String(route.params.level);
const urlType = Number(route.params.type);
const urlRoomId = String(route.params.roomId);
const validLevels = ["pong", "catPong", "customizable"];
const playerOneUserId = ref(0);
const playerTwoUserId = ref(0);
let activeRoomNames: string[];
let activeRooms: any;
let gameInstance: Game;
const data = {
  userId,
  spectator: false,
  challenge: false,
  challengeId: "",
  key: "",
  level: "",
  vueSocket: socket,
  playerOneUserId,
  playerTwoUserId,
};

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
  socket.off();
});

function initGame() {
  socket.emit("getActiveRoomNames", { userId, roomId: urlRoomId });
  socket.on("getActiveRoomNames", (payload: any) => {
    activeRooms = payload.roomNames;
    activeRoomNames = Object.keys(payload.roomNames);
    //console.log(activeRooms);

    if (isValidURL()) {
      socket.off("getActiveRoomNames");
      launchGame();
    } else {
      socket.off();
      router.replace("/");
    }
  });
  socket.on("getPlayersIds", (data) => {
    //console.log("RECEIVING PLAYERS IDS");
    //console.log(data);
    playerOneUserId.value = data.playerOneUserId;
    playerTwoUserId.value = data.playerTwoUserId;
    socket.off("getPlayersIds");
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
    //console.log("URL ROOM ID " + urlRoomId);
    //console.log("ACTIVE ROOM NAMES " + activeRoomNames);
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
  <div id="playersIds">
    <div v-if="playerOneUserId == 0 && playerTwoUserId == 0">
      <h1><span style="float: left">PLAYER ONE : Waiting...</span></h1>
      <h1><span style="float: right">PLAYER TWO : Waiting...</span></h1>
      <div class="clear"></div>
    </div>
    <div v-else>
      <h1>
        <span style="float: left"
          >PLAYER ONE :
          <span class="red">
            {{ usersStore.getUserNickById(playerOneUserId) }}</span
          ></span
        >
      </h1>
      <h1>
        <span style="float: right"
          >PLAYER TWO :
          <span class="red">{{
            usersStore.getUserNickById(playerTwoUserId)
          }}</span></span
        >
      </h1>
      <div class="clear"></div>
    </div>
  </div>
  <div :id="containerId" />
</template>
