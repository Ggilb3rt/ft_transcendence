<script setup lang="ts">
import type { PropType } from "vue";
import UserHero from "@/components/UserHero.vue";
import type { IUser } from '../../types'

const roger: IUser = {
    id: 0,
    two_factor_auth: true,
    first_name: "Roger",
    last_name: "Rabbit",
    nickname: "rogerrabbit",
    avatar_url: "src/assets/avatars/rogerRabbit.png",
    ranking: 3,
    wins: 7,
    loses: 3,
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
