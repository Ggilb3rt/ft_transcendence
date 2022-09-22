<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../stores/user'
import type { IUser } from '../../types'



const userStore = useUserStore()
// const { getUserNick } = useUserStore()
// const { getUserNick } = storeToRefs(user) // make getUserNick has a ref ==> reactive
let toggleMatch = ref(true);

const matchsHistory = [
  {
    opponent: 2,
    win: true,
    myScore: 7,
    opponentScore: 3
  },
  {
    opponent: 3,
    win: false,
    myScore: 3,
    opponentScore: 5
  },
  {
    opponent: 3,
    win: false,
    myScore: 1,
    opponentScore: 7
  },
  {
    opponent: 3,
    win: true,
    myScore: 7,
    opponentScore: 0
  },
  {
    opponent: 3,
    win: false,
    myScore: 2,
    opponentScore: 7
  }
]


</script>

<template>
	<div>
		<h1 @click="toggleMatch = !toggleMatch">Match History</h1>
		<div class="matchHistory" :class="{hide: !toggleMatch }" v-if="matchsHistory != null">
		<div v-for="match in matchsHistory" :key="match.opponent">
			<div :class="{win: match.win, loose:!match.win}" class="matchResume">
			<div class="me">
				<img class="heroAvatar" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'">
				<p>{{userStore.getUserNick()}}</p>
			</div>
			<div class="score">
				<p>
				<span :class="{scoreLose: !match.win}">{{match.myScore}}</span> - 
				<span :class="{scoreLose: match.win}">{{match.opponentScore}}</span>
				</p>
			</div>
			<div class="opponent">
				<img class="heroAvatar" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'">
				<p>@dark_sasuke</p>
			</div>
			</div>
		</div>
		</div>
		<div v-else>
			<p>No matchs here
			<a href="/">Make your first game</a>
			</p>
		</div>
	</div>
</template>

<style>

.matchHistory {
  color: #fff;
  height: auto;
  max-height: 200vh;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  overflow: hidden;
  transform: scaleY(1);
  transition: all .5s ease-out;
}

.matchHistory .matchResume {
  display: flex;
  padding: 10px;
}

.matchHistory .score {
  min-width: 50px;
}

.matchHistory .win .score p:after {
  left: 0;
}

.matchHistory .loose .score p:after {
  right: 0;
}

.matchHistory .me, .matchHistory .opponent {
  overflow-wrap: break-word;
}

.matchHistory .opponent {
  text-align: right;
}

.matchHistory img {
  width: 100px;
}

.matchHistory .win .opponent, .matchHistory .loose .me, .matchHistory .scoreLose { opacity: .5; }

.matchHistory .win {
  background: var(--global-c-blue-hover);
}

.matchHistory .loose {
  background: var(--global-c-red-hover);
}


@media (min-width: 322px) {
  .matchHistory .score {
    font-size: 2em;
  }

  .matchHistory .score p:after {
    content: '';
    display: block;
    position: absolute;
    width: 50%;
    height: 6px;
    background: #fff;
  }
}
</style>