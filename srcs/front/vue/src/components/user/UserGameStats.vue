<script setup lang="ts">
// import { storeToRefs } from 'pinia';
// import { useUserStore } from '../stores/user';
import type { IUser, IOtherUser} from '@/types'


const props = defineProps<{
	user: IUser | IOtherUser,
	userLevel: string,
  userWinRate: string
}>()

console.log('props ', props)
// const userStore = useUserStore()
// const { getUserLevel } = useUserStore()

</script>

<template>
  <div class="heroStat">
    <hr>
    <div class="heroGameStat">
      <div>
        <h3>Level</h3>
        <p class="level statVal">{{ props.userLevel }}</p>
      </div>
      <div>
        <h3>Win rate</h3>
        <p class="winRate statVal">{{ props.userWinRate }}</p>
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
