<script setup lang="ts">
import { ref, useSlots } from "vue"
import router from "../router";
import { setStatus, useUserStore } from '../stores/user'
import { mande, defaults } from 'mande'

const userStore = useUserStore()
const code = ref("")

defaults.headers.AccessControleAllowOrigin = "http://localhost:5173"

async function submitCode() {
	console.log("send data ", code.value)

	// try {
	// 	const api = mande("http://localhost:3000/auth/2fa");
	// 	console.log("mande ", api)
	// 	await api.post({
	// 		code: code.value
	// 	})
	// 	.then((res) => {
	// 		console.log(res)
	// 		if (res.status >= 200 && res.status < 300)
	// 			return res.json()
	// 		throw new Error(res.statusText)
	// 	})
	// 	.then((data) => {
	// 		console.log('data from change code', data)

	// 	})
	// } catch (error: any) {
	// 	console.log('change code err', error)
	// 	userStore.error = error
	// }


	let myHeaders = new Headers()

	myHeaders.append("Access-controle-allow-origin", "http://localhost:5173")


	let mybody = {
		code: `${code.value}`
	}

	try {
      await fetch(`http://localhost:3000/auth/2fa`, {
        method: 'POST',
        credentials: "include",
		mode: "cors",
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
			// 'Access-Control-Allow-Origin': 'http://localhost:5173'
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
            	console.log("return data ", data)
				userStore.changeStatus(setStatus.connected)
				userStore.loading = false
				router.push("/success")

              }
          })
    } catch (error: any) {
		console.log(error)
        userStore.error = "2fa error " + error
		userStore.loading = false
    }


}

</script>

<template>
	<div>
		<p>Enter your code</p>
		<input type="text" v-model="code" @keypress.enter="submitCode()">
		<button @click="submitCode()">Submit</button>
		<p class="error">{{ userStore.error }}</p>
	</div>
</template>