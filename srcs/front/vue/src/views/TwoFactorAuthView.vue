<script setup lang="ts">
import { ref } from "vue"
import router from "../router";
import { setStatus, useUserStore } from '../stores/user'
import Loader from '../components/navigation/loader.vue';

const userStore = useUserStore()
const code = ref("")

async function submitCode() {
	const mybody = {code: `${code.value}`}

	try {
      await fetch(`http://localhost:3000/auth/2fa`, {
        method: 'POST',
        credentials: "include",
		mode: "cors",
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
        body: JSON.stringify(mybody)
      })
          .then((response) => {
			userStore.loading = true
            if (response.status >= 200 && response.status < 300) {
                return response.json()
            }
                throw new Error(response.statusText)
          })
          .then((data) => {
            if (data) {
				userStore.changeStatus(setStatus.connected)
				userStore.loading = false
				userStore.twoFactorAuth = true
				router.push("/")

              }
          })
    } catch (error: any) {
        userStore.error = error.body
		userStore.loading = false
    }

}

</script>

<template>
	<div class="loginWrapper">
		<Loader></Loader>
		<div>
			<h1>Two-Factor<br>Authentication</h1>
		</div>
		<div class="flex-column">
			<input type="text" v-model="code" @keypress.enter="submitCode()" placeholder="ex: 123456" class="logo">
			<button @click="submitCode()" class="btn">Send your code</button>
		</div>
	</div>
</template>

<style>

/* Uses the styles of LoginView.vue */

</style>