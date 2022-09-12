<script setup lang="ts">
import type { PropType } from "vue";
import UserHero from "@/components/UserHero.vue";
import type { IUser } from '../../types'

const roger: IUser = {
  id: 0,
  isAdmin: true,
  name: "Roger Rabbit",
  tag: "rogerrabbit",
  img: "src/assets/avatars/rogerRabbit.png",
  level: 3,
  nbWin: 7,
  nbLoose: 3,
};

// const props = defineProps({
//   user: {
//     type: Object as () => PropType<IUser>,
//   },
// });
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <UserHero :userProp="0" />
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
