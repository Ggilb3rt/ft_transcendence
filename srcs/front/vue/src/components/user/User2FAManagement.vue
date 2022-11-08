<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user';
import Modal from '../Modal.vue';
import CarbonTwoFactorAuthentication from '@/components/icones-bags/CarbonTwoFactorAuthentication.vue'

const userStore = useUserStore()

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
			credentials: "include",
			body: JSON.stringify({
				status: !userStore.user.two_factor_auth,
			})
		})
		.then((response) => {
			if (response.status >= 200 && response.status < 300) {
				console.log("enable 2FA ", response)
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
			console.log("j'aimerai changer le store svp")
			userStore.change2FA()
			userStore.set2FAConnect(!userStore.twoFactorAuth)
		})
	} catch (error: any) {
		console.log('change 2FA err', error)
		userStore.error = error
	} finally {
		// console.log("j'aimerai changer le store svp")
		// userStore.change2FA()
		// userStore.set2FAConnect(!userStore.twoFactorAuth)
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
			credentials: "include",
			body: JSON.stringify({
				status: !userStore.user.two_factor_auth,
				code: disable2FACode.value
			})
		})
		.then((response) => {
			if (response.status >= 200 && response.status < 300) {
				console.log("disable 2FA", response)
				return response.json
			}
			throw new Error(response.statusText)
		})
		.then((data) => {
			console.log('disable 2FA data ', data)
			console.log("j'aimerai changer le store svp")
			userStore.change2FA()
			userStore.set2FAConnect(!userStore.twoFactorAuth)
		})
	} catch (error: any) {
		console.log('change 2FA err', error)
		userStore.error = error
	} finally {
		// console.log("j'aimerai changer le store svp")
		// userStore.change2FA()
		// userStore.set2FA(!userStore.twoFactorAuth)
	}
}
</script>

<template>
	<div class="security">
		<h1>
			<i class="icon_btn">
				<CarbonTwoFactorAuthentication></CarbonTwoFactorAuthentication>
			</i>
			Security
		</h1>
		<div v-if="userStore.user.two_factor_auth">
			<p>Use your code to disable 2FA</p>
			<input type="text" v-model="disable2FACode">
			<button @click="disable2FA()" >Disable</button>
		</div>
		<div v-else>
			<p>Use two factor auth</p>
			<button @click="enable2FA()">Enable</button>
		</div>
		<Modal :show="showQr" @click="showQr = false">
			<template #header>
				<h2>Scan with google authenticator</h2>
			</template>
			<template #body>
				<img :src="twoFA_QR" alt="AuthQRcode" v-if="twoFA_QR != ''">
			</template>
		</Modal>
	</div>
</template>

<style scoped>
.security {
	margin-bottom: 10px;
}

</style>