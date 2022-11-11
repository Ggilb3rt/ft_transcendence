<script setup lang="ts">
import UserHero from "@/components/user/UserHero.vue";
import { useUserStore } from "@/stores/user";
import { useUsersStore } from "@/stores/users";

const userStore = useUserStore()
const usersStore = useUsersStore()
</script>

<template>
  <div class="vue_wrapper dashboard" v-if="userStore.user && !userStore.loading && usersStore.userList && !usersStore.loading">
    <h1>Dashboard</h1>
      <UserHero />
  </div>
</template>

<style>

</style>
