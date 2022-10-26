<script setup lang="ts">
import { ref, useSlots } from "vue"
import router from "../router";
import { useUserStore } from '../stores/user'
import { mande } from 'mande'

const userStore = useUserStore()
const code = ref("")

async function submitCode() {
	console.log("send data ", code.value)

	try {
		const api = mande("http://localhost:3000/auth/2fa");
		await api.post({
			code: code.value
		})
		.then((res) => {
			console.log(res)
			if (res.status >= 200 && res.status < 300)
				return res.json()
			throw new Error(res.statusText)
		})
		.then((data) => {
			console.log('data from change code', data)

		})
	} catch (error: any) {
		console.log('change code err', error)
		userStore.error = error
	}



	// try {
    //   await fetch(`http://localhost:3000/auth/2fa`, {
    //     method: 'POST',
    //     credentials: "include",
    //     body: code.value,
    //   })
    //       .then((response) => {
    //           if (response.status >= 200 && response.status < 300) {
    //               return response.json()
    //             }
    //             throw new Error(response.statusText)
    //       })
    //       .then((data) => {
    //           if (data) {
    //             console.log("return data ", data)
	// 			userStore.set2FA(true)

    //           }
    //       })
    // } catch (error: any) {
	// 	console.log(error)
    //     // userStore.error = "changeImg avatar " + error
    // }



	// fetch
		// if ok 
			// route to home
		if (code.value == "lol") {
			userStore.set2FA(true)
			router.push("/")
		}
		// else
			// print error msg
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