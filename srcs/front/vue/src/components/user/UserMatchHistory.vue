<script setup lang="ts">
import { ref } from 'vue'
import type { IUser, IOtherUserRestrict, IOtherUser } from '../../../types'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import UserLink from './UserLink.vue'
import BtnChallenge from '../navigation/BtnChallenge.vue'

const props = defineProps<{
  user: IUser | IOtherUser
}>()

const userStore = useUserStore()
const usersStore = useUsersStore()
let toggleMatch = ref(true);

function findOpponent(opponent: number): IOtherUserRestrict | null {
    return usersStore.userList.filter((leuser) => props.user.match_history.find(el => leuser.id === opponent))[0]
}

</script>

<template>
	<div>
		<h1
			@click="toggleMatch = !toggleMatch"
			:class="{
				triangleUp: toggleMatch && user.match_history != null && user.match_history.length > 0,
				triangleDown: !toggleMatch && user.match_history != null && user.match_history.length > 0}"
		>
			Match History
		</h1>
		<div class="matchHistory" :class="{hide: !toggleMatch }" v-if="user.match_history != null && user.match_history.length > 0">
			<div v-for="match in user.match_history" :key="match.opponent">
			<!-- {{ match.date.getDate()+"/"+(match.date.getMonth() + 1)+"/"+match.date.getFullYear()+" "+match.date.getHours()+":"+match.date.getMinutes()+":"+match.date.getSeconds() }} -->
				<div :class="{win: match.win, loose:!match.win}" class="matchResume">
					<div class="me">
						<img class="userAvatar" :src="user.avatar_url" :alt="user.nickname + ' avatar'">
						<p>{{ user.nickname }}</p>
				</div>
					<div class="score">
						<p>
							<span :class="{scoreLose: !match.win}">{{match.myScore}}</span> - 
							<span :class="{scoreLose: match.win}">{{match.opponentScore}}</span>
						</p>
					</div>
					<div class="opponent">
						<UserLink :other-user="findOpponent(match.opponent)" remove-status></UserLink>
					</div>
				</div>
			</div>
		</div>
		<div v-else>
			<p>No matchs here
				<router-link to="/" v-if="user.id == userStore.user.id">Make your first game</router-link>
				<BtnChallenge v-else :user-id="user.id"></BtnChallenge>
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
  border-radius: var(--global-border-radius);
}

.matchHistory img {
  max-width: 40%;
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