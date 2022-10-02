<script setup lang="ts">
import { watch } from "vue";
import UserHero from "@/components/UserHero.vue";
import UserGameStats from "@/components/UserGameStats.vue"
import UserMatchHistory from "@/components/UserMatchHistory.vue";
import UserList from "@/components/UserList.vue";
import UserBasicsOther from "@/components/UserBasicsOther.vue";
import { useUsersStore } from "@/stores/users";
import router from "@/router";


const usersStore = useUsersStore()

// need id from url
// function updateUser() {
  // const userId: string = router.currentRoute.value.params.id
  // console.log(userId)
  // usersStore.getOtherUser(Number(userId))
// }

watch(
  () => router.currentRoute.value.params,
  (toParams, previousParams) => {
        console.log('goooooo ', toParams)
        console.log('go ', previousParams)
      if (toParams.id)
        usersStore.getOtherUser(Number(toParams.id))

        // react to route changes...
      }
)


// watch(nicknameEdit, () => {
// 	nicknameEdit.value = removeSpecialChar(nicknameEdit.value)
// })

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

      <UserMatchHistory></UserMatchHistory>

      <UserList title="Friends" :user="usersStore.user" :list="usersStore.user.friends"></UserList>
    </div>
  </div>
</template>

<style>

</style>
