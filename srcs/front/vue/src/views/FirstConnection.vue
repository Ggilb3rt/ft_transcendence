<script setup lang="ts">
import { ref } from "vue"
import router from "../router";
import Loader from '../components/navigation/loader.vue';
import { useUserStore } from "@/stores/user";
import UserEditableNick from "@/components/user/UserEditableNick.vue";
import UserEditableAvatar from "@/components/user/UserEditableAvatar.vue";

const userStore = useUserStore()

async function valid() {
	try {
		const response = await fetch(`http://localhost:3000/auth/first`, {credentials: "include"})
		var data;
		if (response.status >= 200 && response.status < 300) {
			data = await response.json()
		}
		else {
			throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
		}
		if (data) {
			console.log("first time ", data)
		}
	} catch (error: any) {
		const tempErr = JSON.parse(error.message);
		userStore.error = tempErr.body;
	} finally {

	}
}

</script>

<template>
	<div class="loginWrapper">
		<Loader></Loader>
		<div>
			<h1>Welcome to the internet !</h1>
		</div>
		<div class="flex-column">
			<UserEditableNick></UserEditableNick>
			<UserEditableAvatar class="first-img"></UserEditableAvatar>

			<button @click="valid()" class="btn">Done</button>
		</div>
	</div>
</template>

<style>
/* .first-img {
	max-width: 50%;
	max-height: 50%;
	object-fit: cover;
} */
/* Uses the styles of LoginView.vue */

</style>