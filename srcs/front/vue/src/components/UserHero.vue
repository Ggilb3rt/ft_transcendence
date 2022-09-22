<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import UserGameStats from './UserGameStats.vue'
import UserList from './UserList.vue'
import UserMatchHistory from './UserMatchHistory.vue'
import type { IUser } from '../../types';


const userStore = useUserStore()
// const { getUserNick } = useUserStore()
// const { getUserNick } = storeToRefs(user) // make getUserNick has a ref ==> reactive



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
	|	btn bloquer				||			Ø						|
	|	Ø						||	btn du mode édition				|

*/

</script>

<template>
	<div class="heroCard">
		<div class="userBasics">
			<img class="heroAvatar" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'">
			<p class="heroName">{{ userStore.user.first_name }} {{ userStore.user.last_name}}</p>
			<p class="heroTag">
				<a href="#">{{ userStore.getUserNick() }}</a>
			</p>
		</div>
		<UserGameStats :id="userStore.user.id" />

		<UserMatchHistory></UserMatchHistory>

		<div class="listOfUsers">
			<h1>Friends static</h1>
			<div class="usersInList">
			<div class="userInList">
				<img src="../assets/avatars/homer.jpeg" alt="default user">
				<p><a href="#friendsLink">@basicFriend</a></p>
				<button>X</button>
			</div>
			<div class="userInList">
				<img src="../assets/avatars/default.jpg" alt="default user">
				<p><a href="#friendsLink">@basic2Friend</a></p>
				<button>X</button>
			</div>
			</div>
		</div>

		<UserList title="Friends" :user="userStore.user" :list="userStore.user.friends"></UserList>
		<UserList title="Block" :user="userStore.user" :list="userStore.user.blocks" ></UserList>

		<!-- <div v-for="user in users.userList" :key="user.id" class="heroCard">
		<br>
		<img class="heroAvatar" :src="user.avatar_url" :alt="user.nickname + ' avatar'" />
		<p class="heroName">{{ user.first_name }} {{ user.last_name}}</p>
		<p class="heroTag">
			<a href="#">{{ getUserNick(user) }}</a>
		</p>
		<UserGameStats :id="user.id" />

		<UserList title="Friends" :user="user" :list="user.friends"></UserList>
		<UserList title="Block" :user="user" :list="user.blocks" ></UserList>

		</div> -->
	</div>
</template>

<style>

.listOfUsers .usersInList {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	text-align: center;
}

.listOfUsers .usersInList .userInList button {
	position: absolute;
	top: -5px;
	right: -5px;
	color: #fff;
	background: var(--global-c-red);
	border: 1px solid var(--global-c-red-hover);
	display: none;
}

.listOfUsers .usersInList .userInList:hover button{
	display: block;
}
.listOfUsers .usersInList .userInList img{
	width: 100px;
}


.heroCard .userBasics img{
	/* max-width: 300px; */
}

.heroCard p {
  font-family: "Inder", sans-serif;
  font-style: normal;
  font-weight: 400;
}

.heroCard .heroAvatar {
  max-width: 40%;
  border-radius: 10px;
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

</style>
