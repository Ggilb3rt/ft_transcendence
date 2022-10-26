<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import UserGameStats from './UserGameStats.vue'
import UserList from './UserList.vue'
import UserMatchHistory from './UserMatchHistory.vue'
import UserBasics from './UserBasics.vue';
import Modal from '../Modal.vue';
import type { IUser } from '@/types';

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
-----------------------------------------------------------------


*/

const twoFA_QR = ref("")
const showQr = ref(false)
const disable2FACode = ref("")

async function enable2FA() {
	// send to server
	try {
		await fetch(`http://localhost:3000/users/${userStore.user.id}/2fa`, {
			method: 'POST',
			headers: {
				// 'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			mode: "cors",
			credentials: "include",
			body: JSON.stringify({
				status: !userStore.user.two_factor_auth,
			})
		})
		.then((response) => {
			if (response.status >= 200 && response.status < 300) {
				console.log(response)
				return response
			}
			throw new Error(response.statusText)
		})
		.then((data): Blob => {
			console.log('data from change 2FA', data)
			return data.blob()
		})
		.then((blob: Blob) => {
			console.log("le blob de fin ", blob)
			twoFA_QR.value = URL.createObjectURL(blob)
			showQr.value = true
		})
	} catch (error: any) {
		console.log('change 2FA err', error)
		userStore.error = error
		// return
	} finally {
		console.log("j'aimerai changer le store svp")
		userStore.change2FA()
		userStore.set2FA(!userStore.twoFactorAuth)
	}
}

async function disable2FA() {
	try {
		await fetch(`http://localhost:3000/users/${userStore.user.id}/2fa`, {
			method: 'POST',
			headers: {
				// 'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			mode: "cors",
			credentials: "include",
			body: JSON.stringify({
				status: !userStore.user.two_factor_auth,
				code: disable2FACode.value
			})
		})
		.then((response) => {
			if (response.status >= 200 && response.status < 300) {
				console.log(response)
				return response.json
			}
			throw new Error(response.statusText)
		})
		.then((data) => {
			console.log('disable 2FA data ', data)

		})
	} catch (error: any) {
		console.log('change 2FA err', error)
		userStore.error = error
		// return
	} finally {
		console.log("j'aimerai changer le store svp")
		userStore.change2FA()
		userStore.set2FA(!userStore.twoFactorAuth)
	}
}

</script>

<template>
	<div class="heroCard">
		<UserBasics></UserBasics>

		<UserGameStats
			:user="userStore.user"
			:user-rank="userStore.getUserRank"
			:user-win-rate="userStore.getWinRate"
		/>

		<UserMatchHistory
			:user="userStore.user"
		/>
		
		<UserList title="Friends" :user="userStore.user" :list="userStore.user.friends" canEdit></UserList>
		<UserList title="Ban" :user="userStore.user" :list="userStore.user.bans" canEdit></UserList>
		
		<div class="security">
			<h1>Security</h1>
			<p>Use two factor auth</p>
			<div v-if="userStore.user.two_factor_auth">
				<button @click="disable2FA()" >Enable</button>
				<input type="text" v-model="disable2FACode">
				{{ disable2FACode }}
			</div>
			<button @click="enable2FA()" v-else>Disable</button>
			<modal :show="showQr" @click="showQr = false">
				<template #header>
					<h2>Scan with google authenticator</h2>
				</template>
				<template #body>
					<img :src="twoFA_QR" alt="AuthQRcode" v-if="twoFA_QR != ''">
				</template>
			</modal>
			
		</div>
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
