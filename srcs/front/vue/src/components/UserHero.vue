<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import { useUsersStore } from '@/stores/users';
import UserGameStats from './UserGameStats.vue'
import UserList from './UserList.vue'
import UserMatchHistory from './UserMatchHistory.vue'
import UserBasics from './UserBasics.vue';
import type { IUser } from '../../types';


const props = defineProps<{
	otherUser?: boolean
}>()

const userStore = useUserStore()
const usersStore = useUsersStore()

// edit system
/*
if route id == user id && verifyConnected
change p.heroName p.heroTag img.heroAvatar by input with data
		when validate changes 
		send post request with all data (not only the changed => easyer)
		if response OK
					update the local pinia store
					*/
					
/*
-----------------------------------------------------------------
|		Si pas moi			||			Si moi					|
|----------------------------------------------------------------
|	btn de demande d'ami	||	liste des demandes en attentes	|
|	btn bloquer				||	btn du mode édition				|
|	0						||	btn 2FA							|


*/

</script>

<template>
	<div class="heroCard" v-if="!otherUser">
		<UserBasics></UserBasics>

		<UserGameStats
			:user="userStore.user"
			:user-level="userStore.getUserLevel()"
			:user-win-rate="userStore.getWinRate"
		/>

		<UserMatchHistory></UserMatchHistory>

		<UserList title="Friends" :user="userStore.user" :list="userStore.user.friends" canEdit></UserList>
		<UserList title="Ban" :user="userStore.user" :list="userStore.user.ban_users_ban_users_idTousers" canEdit></UserList>
		
		<div class="security">
			<h1>Security</h1>
			<p>User double auth : <button>Enable</button></p>
		</div>
	</div>
	<div v-else>
		Other User
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
	max-width: 100%;
	border-radius: 10px;
}

.heroCard .heroFigure {
	max-width: 60%;
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
		max-width: 40%;
	}
}

@media screen and (min-width: 1024px) {
	.heroCard .heroFigure {
		max-width: 20%;
	}
}

</style>
