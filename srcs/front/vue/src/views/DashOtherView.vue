<script setup lang="ts">
import { watch } from "vue";
import UserHero from "@/components/user/UserHero.vue";
import UserGameStats from "@/components/user/UserGameStats.vue"
import UserMatchHistory from "@/components/user/UserMatchHistory.vue";
import UserList from "@/components/user/UserList.vue";
import UserBasicsOther from "@/components/user/UserBasicsOther.vue";
import { useUsersStore } from "@/stores/users";
import router from "@/router";
import { onBeforeRouteUpdate } from "vue-router";

const usersStore = useUsersStore()

// need id from url
// function updateUser() {
  // const userId: string = router.currentRoute.value.params.id
  // console.log(userId)
  // usersStore.getOtherUser(Number(userId))
// }


</script>

<template>
  <div class="vue_wrapper dashboard">
    <h1>Player</h1>
    <div class="heroCard">
      <UserBasicsOther></UserBasicsOther>

      <UserGameStats
        :user="usersStore.user"
        :user-level="usersStore.getUserLevel()"
        :user-win-rate="usersStore.getUserWinRate()"
      />

      <UserMatchHistory
        :user="usersStore.user" 
      />

      <UserList title="Friends" :user="usersStore.user" :list="usersStore.user.friends"></UserList>
    </div>
  </div>
</template>

<style>

</style>
