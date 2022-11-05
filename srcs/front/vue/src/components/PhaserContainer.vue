<script setup lang="ts">
import { onMounted } from "vue";
//import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';
import { useStatusStore } from '@/stores/status';
import Phaser from "phaser";

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

class Game extends Phaser.Game {
  constructor() {
    super(config);
    this.scene.add("MenuScene", MenuScene);
    this.scene.add("WaitinRoom", WaitingRoom);
    this.scene.add("DefaultGame", DefaultGame);
    this.scene.add("CustomizableGame", CustomizableGame);
    this.scene.add("CatPongGame", CatPongGame);
    this.scene.add("Preloader", Preloader);
    this.scene.start("Preloader", { userId: userStore.user.id });
  }
}

onMounted(() => {
 //console.log(usersStatusStore.statusList);
    const gameInstance = new Game();
});
</script>

<template>
  <div :id="containerId" />
</template>
