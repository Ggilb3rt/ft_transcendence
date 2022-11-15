<script setup lang="ts">
import type { IUser, IOtherUser} from '@/types'

const props = defineProps<{
	user: IUser | IOtherUser,
  userRank: string,
  userWinRate: number
}>()

function canPrintWinRate(): boolean {
  return isNaN(props.userWinRate)
}

</script>

<template>
  <div class="heroStat">
    <hr>
    <div class="heroGameStat">
      <div>
        <h3>Level</h3>
        <p class="level statVal">{{ userRank }}</p>
      </div>
      <div>
        <h3>Win rate</h3>
        <p class="winRate statVal">{{ userWinRate.toFixed(2) }}%</p>
      </div>
      <div>
        <h3>Last battle</h3>
        <p class="lastWin statVal" v-if="props.user.match_history && props.user.match_history.length > 0">
          {{ props.user.match_history[0].myScore }} - {{ props.user.match_history[0].opponentScore}}
        </p>
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
  flex-direction: column;
  font-family: "Inder", sans-serif;
  font-style: normal;
  font-weight: 400;
}

.heroStat .statVal {
  font-size: 20px;
  line-height: 25px;
  color: #fff;
}

@media screen and (min-width: 400px) {
	.heroGameStat {
		flex-direction: row;
    justify-content: space-between;
	}
}

</style>
