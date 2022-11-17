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
			router.push("/home")
		}
	} catch (error: any) {
		const tempErr = JSON.parse(error.message);
		userStore.error = tempErr.body;
	} finally {

	}
}

</script>

<template>
	<div class="loginWrapper vue-wrapper">
		<Loader></Loader>
		<div>
			<h1>Welcome <span class="red">{{ userStore.user.first_name }}</span> </h1>
			<p>Please choose your avatar and nick</p>
		</div>
		<div id="first-wrapper">
			<UserEditableAvatar class="first-img"></UserEditableAvatar>
			<div>
				<h3>Nick based on 42 nick</h3>
				<UserEditableNick no-hero-name></UserEditableNick>
			</div>
		</div>
		<button @click="valid()" class="btn">Done</button>
	</div>
</template>

<style scoped>

.loginWrapper {
	height: auto;
	gap: 30px;
	text-align: right;
	background: var(--color-background);
}

#first-wrapper {
	display: flex;
	flex-direction: column-reverse;
	gap: 20px;
}

p {color: var(--vt-c-white-mute); text-shadow: #000 1px 1px 10px;}
h3 {color: var(--vt-c-white-soft); text-shadow: #000 1px 1px 10px;}

/* .first-img {
	max-width: 50%;
	max-height: 50%;
	object-fit: cover;
} */
/* Uses the styles of LoginView.vue */

@media screen and (min-width: 768px) {
	.loginWrapper {
		text-align: left;
	}

	#first-wrapper {
		flex-direction: row;
		gap: 20px;
	}
}

</style>