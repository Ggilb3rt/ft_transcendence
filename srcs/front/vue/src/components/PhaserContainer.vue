<script setup lang="ts">
import { onMounted } from "vue";
import Phaser from "phaser";

import config from "./game/config";
import Preloader from "./game/scenes/Preloader";
import WaitingRoom from "./game/scenes/WaitingRoom";
import MenuScene from "./game/scenes/MenuScene";
import DefaultGame from "./game/scenes/DefaultGame";
import CustomizableGame from "./game/scenes/CustomizableGame";
import CatPongGame from "./game/scenes/CatPongGame";

const containerId = "game-container";

class Game extends Phaser.Game {
  constructor() {
    super(config);
	this.scene.add("Preloader", Preloader);
    this.scene.add("MenuScene", MenuScene);
    this.scene.add("WaitinRoom", WaitingRoom);
    this.scene.add("DefaultGame", DefaultGame);
    this.scene.add("CustomizableGame", CustomizableGame);
	this.scene.add("CatPongGame", CatPongGame);
    this.scene.start("Preloader");
  }
}

onMounted(() => {
  const gameInstance = new Game();
});
</script>

<template>
  <div :id="containerId" />
</template>
