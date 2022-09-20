<script setup lang="ts">
// import { storeToRefs } from 'pinia';
import { useUsersStore } from '../stores/users';

const users = useUsersStore()
const { getUserLevel, getUserWinRate } = useUsersStore()

const props = defineProps({
  id: Number
})

</script>

<template>
  <div class="heroStat">
    <hr>
    <div v-for="user in users.userList" :key="user.id" class="heroGameStat">
      <div v-if="id == user.id">
        <h3>Level</h3>
        <p class="level statVal">{{ getUserLevel(user) }}</p>
      </div>
      <div v-if="id == user.id">
        <h3>Win rate</h3>
        <p class="winRate statVal">{{ getUserWinRate(user) }}</p>
      </div>
      <div v-if="id == user.id">
        <h3>Last win</h3>
        <p class="lastWin statVal">5 - 3</p>
      </div>
    </div>
    <hr>
  </div>
</template>

<style scoped>

.heroStat {
  margin: 15px 0;
}
.heroStat hr {
  margin: 15px 0;
}
.heroGameStat {
  display: flex;
  justify-content: space-between;
  font-family: "Inder", sans-serif;
  font-style: normal;
  font-weight: 400;
}

.heroStat .statVal {
  font-size: 20px;
  line-height: 25px;
  color: #fff;
}

</style>
