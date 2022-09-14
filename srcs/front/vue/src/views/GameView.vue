<script setup lang="ts">
import Game from "@/components/Game.vue";


</script>

<template>
  <div class="dashboard">
    <h1>Classic Pong</h1>
    <Game msg="Bonjour le jeu" />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inder&display=swap");

@media (min-width: 1024px) {
  .dashboard {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
