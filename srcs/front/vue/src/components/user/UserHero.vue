<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import UserGameStats from './UserGameStats.vue'
import UserList from './UserList.vue'
import UserMatchHistory from './UserMatchHistory.vue'
import UserBasics from './UserBasics.vue';
import User2FAManagement from './User2FAManagement.vue';

const userStore = useUserStore()

</script>

<template>
	<div class="heroCard">
		<UserBasics></UserBasics>

		<UserGameStats
			:user="userStore.user"
			:user-rank="userStore.getUserRank()"
			:user-win-rate="userStore.getWinRate()"
		/>

		<UserMatchHistory
			:user="userStore.user"
		/>
		
		<UserList title="Friends" :user="userStore.user" :list="userStore.user.friends" canEdit></UserList>
		<UserList title="Ban" :user="userStore.user" :list="userStore.user.bans" canEdit></UserList>
		
		<User2FAManagement></User2FAManagement>
	</div>
</template>

<style>

.heroCard p {
  font-family: "Inder", sans-serif;
  font-style: normal;
  font-weight: 400;
}

.heroCard .userBasics {
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	gap: 20px;
}

.heroCard .heroAvatar {
	max-width: 500px;
	width: 100%;
	border-radius: 10px;
}

.heroCard .heroFigure {
	max-width: 100%;
	border-radius: 10px;
	overflow: hidden;
}
/* 
.heroCard .heroFigure img:hover {
	border: 1px solid rgb(21, 216, 255);
} */

.heroCard .heroFigure #changeAvatar {
	cursor: pointer;
	font-family: "Inder", sans-serif;
	color: var(--global-c-blue);
	background: rgba(255,255,255, 1);
	height: 50px;
	width: 100%;
	position: absolute;
	transition: all .2s ease-in-out;
	padding: 0 10px;
	left: 0;
	bottom: 0;
	opacity: 0;
	/* transform: translateY(100%); */
	content: 'change avatar';
	display: block;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.heroCard .heroFigure:hover #changeAvatar {
	opacity: 1;
}


.heroCard .heroName {
  font-size: 24px;
  line-height: 30px;
}

.heroCard .heroTag {
  font-size: 15px;
  line-height: 19px;
}

.hide {
  max-height: 0px;
  transform: scaleY(0);
  transform-origin: top;
}

@media screen and (min-width: 400px) {
	.heroCard .userBasics {
		flex-direction: row;
	}
	.heroCard .heroFigure {
		max-width: 60%;
	}
}

@media screen and (min-width: 1024px) {
	.heroCard .heroFigure {
		max-width: 50%;
	}
}

</style>
