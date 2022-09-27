<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import type { IUser } from '../../types';

const userStore = useUserStore()

function resInvite(sayYes: boolean, id: number) {
	if (sayYes) {
		console.log(id)
		userStore.addFriend(id)
		// send info to back => remove from bdd
			// create relation with id
			// remove id from invite
	}
	userStore.user.invites.forEach((el, index) => {
		if (el == id)
			userStore.user.invites.splice(index, 1)
	})
}

</script>

<template>
	<div class="invites" v-if="userStore.user.invites != undefined && userStore.user.invites.length > 0">
		<h3>Some new friends</h3>
		<p v-for="invite in userStore.user.invites">
			<a href="#">@{{ invite }}</a> <!-- get other user nick -->
			<button @click="resInvite(true, invite)">Accept</button>
			<button @click="resInvite(false, invite)">Refuse</button>
		</p>
	</div>
</template>

<style scoped>

</style>