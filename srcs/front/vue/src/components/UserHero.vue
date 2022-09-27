<script setup lang="ts">
import { ref, watch } from 'vue'
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
|	btn bloquer				||	btn du mode édition				|
|	0						||	btn 2FA							|


*/



let editMode = ref(false)
let nicknameEdit = ref("")
const nameList = ["pouet", 'lol', "ggilbert"] // need to get it from server

function filteredNames() {
	return nameList.filter((name) => name.toLowerCase() === (nicknameEdit.value.toLowerCase()))
}

function freeNick(newNick: string): boolean {
	for (let i = 0; i != nameList.length; i++) {
		if (nameList[i] == newNick)
			return false
	}
	return true
}

function validNickChange(newNick: string) {
	console.log(newNick)
	if (freeNick(newNick) && newNick.length > 0) {
		// await server validation
		userStore.setUserNick(newNick)
		editMode.value = false
	}
}

function removeSpecialChar(newNick: string) {
	return newNick.replace(/([ `{})(\]\[="':;.,/\\])/g, "")
}

watch(nicknameEdit, () => {
	nicknameEdit.value = removeSpecialChar(nicknameEdit.value)
})



let editImg = ref("")
function changeImg(e) {
	if (e) {
		const img = e.target.files[0]
		let formData = new FormData();
		formData.append('file', this.file);
		confirm("Change your avatar ?" + img)
		// must send to server and wait his response with the server url
		// userStore.setUserAvatar()
	}
}
</script>

<template>
	<div class="heroCard">
		<div class="userBasics">
			<figure class="heroFigure">
				<img class="heroAvatar" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'">
				<input type="file" @change="changeImg( $event )" id="changeAvatar">
			</figure>
			<div>
				<p class="heroName">{{ userStore.user.first_name }} {{ userStore.user.last_name}}</p>
				<p class="heroTag">
					<div v-if="editMode">
						<span>@<input type="text" v-model="nicknameEdit" :placeholder="userStore.user.nickname"></span>
						<button @click="editMode = !editMode">X</button>
						<button @click="validNickChange(nicknameEdit)" :class="{cant_click: filteredNames().length}">Change</button>
						<div v-if="filteredNames().length && nicknameEdit.length">Can't choose this nick</div>
					</div>
					<div v-else>
						<a href="#">{{ userStore.getUserNick() }}</a>
						<button @click="editMode = !editMode">Edit</button>
					</div>
				</p>
			</div>
		</div>

		<UserGameStats />

		<UserMatchHistory></UserMatchHistory>

		<UserList title="Friends" :user="userStore.user" :list="userStore.user.friends"></UserList>
		<UserList title="Block" :user="userStore.user" :list="userStore.user.blocks" ></UserList>
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
