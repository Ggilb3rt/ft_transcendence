<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import type { IUserStoreState } from "@/stores/user"
import { useUsersStore } from "@/stores/users";
import type { IUsersStoreState } from "@/stores/users"

const userStore = useUserStore();
const usersStore = useUsersStore();

// Error, need to put it in component
function removeError(store: IUserStoreState | IUsersStoreState) {
	if (store.error)
		store.error = null
}

</script>


<template>
	<div class="error" v-if="userStore.error || usersStore.error">
		<p v-if="userStore.error">User err : {{ userStore.error }} <button @click="removeError(userStore)">X</button></p> 
		<p v-if="usersStore.error">OtherUser err : {{ usersStore.error }} <button @click="removeError(usersStore)">X</button></p>
	</div>
</template>


<style>
div.error {
	position: fixed;
	z-index: 5;
	padding: 20px;
	top: 0;
	left: 0;
	right: 0;
	color: white;
	background: #FF5555;
	text-align: right;
}

</style>