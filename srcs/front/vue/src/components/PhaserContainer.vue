<script setup>
import { onMounted, onUnmounted } from "vue";

let gameInstance = null;
const containerId = "game-container";
const game = await import("./game2/game");

onMounted(() => {
  gameInstance = game.launch(containerId);
});

onUnmounted(() => {
  gameInstance.destroy(false);
});
</script>

<template>
    <h2>Phaser Container</h2>
  <div :id="containerId" />
</template>

<style></style>
