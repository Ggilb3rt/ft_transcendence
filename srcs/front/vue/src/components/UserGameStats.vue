<script setup lang="ts">
// import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';

const userStore = useUserStore()
const { getUserLevel } = useUserStore()

</script>

<template>
  <div class="heroStat">
    <hr>
    <div class="heroGameStat">
      <div>
        <h3>Level</h3>
        <p class="level statVal">{{ getUserLevel() }}</p>
      </div>
      <div>
        <h3>Win rate</h3>
        <p class="winRate statVal">{{ userStore.getWinRate }}</p>
      </div>
      <div>
        <h3>Last win</h3>
        <p class="lastWin statVal">7 - 3</p>
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
