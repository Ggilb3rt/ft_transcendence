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
	try {
		await fetch(`http://localhost:3000/users/2fa`, {
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
			if (response.status >= 200 && response.status < 300)
				return response
			throw new Error(response.statusText)
		})
		.then((data): Blob => {
			return data.blob()
		})
		.then((blob: Blob) => {
			twoFA_QR.value = URL.createObjectURL(blob)
			showQr.value = true
			userStore.change2FA()
			userStore.set2FAConnect(!userStore.twoFactorAuth)
		})
	} catch (error: any) {
		userStore.error = error
	}
}

async function disable2FA() {
	try {
		await fetch(`http://localhost:3000/users/2fa`, {
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
				return response.json
			}
			throw new Error(response.statusText)
		})
		.then((data) => {
			userStore.change2FA()
			userStore.set2FAConnect(!userStore.twoFactorAuth)
		})
	} catch (error: any) {
		userStore.error = error
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