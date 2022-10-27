<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import Phaser from "phaser";
/*import launch from "./game2/game";

let gameInstance: any = null;
const containerId = "game-container";
//const game = await import("./game2/game");


onMounted(() => {
  gameInstance = launch(containerId);
});
onUnmounted(() => {
  gameInstance.destroy(false);
});*/

import config from "./game2/config";
import MainScene from "./game2/scenes/MainScene";
import WaitingRoom from "./game2/scenes/WaitingRoom";
import MenuScene from "./game2/scenes/MenuScene";
import LevelOneScene from "./game2/scenes/LevelOneScene";

let gameInstance: any = null;
const containerId = "game-container";

class Game extends Phaser.Game {
    constructor() {
        super(config);
        this.scene.add("MenuScene", MenuScene);
        this.scene.add("WaitinRoom", WaitingRoom);
        this.scene.add("LevelOneScene", LevelOneScene);
        //this.scene.add("MainScene", MainScene);
        //this.scene.add("WaitingRoom", WaitingRoom);
        this.scene.start("MenuScene");
        //this.scene.add('TaskScene', TaskScene);
        //this.scene.start("MainScene");
    }
}

onMounted(() => {
    gameInstance = new Game();
})


</script>

<template>
  <div :id="containerId" />
</template>
