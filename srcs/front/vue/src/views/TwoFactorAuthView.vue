<script setup>
import { ref, useSlots } from "vue"
import router from "../router";
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const code = ref("")

async function submitCode() {
	console.log("send data ", code.value)
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
		<p class="error">{{ userStore.user.error }}</p>
	</div>
</template>