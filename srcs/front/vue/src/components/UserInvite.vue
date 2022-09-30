<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import { useUsersStore } from '../stores/users';
import UserLink from './UserLink.vue';
import type { IUser, IOtherUserRestrict } from '../../types';

const userStore = useUserStore()
const usersStore = useUsersStore()

function resInvite(sayYes: boolean, id: number) {
	if (sayYes) {
		console.log(id)
		userStore.addFriend(id)
		// send info to back => remove from bdd
			// create relation with id
			// remove id from invite
	}
	userStore.user.invites.forEach((el, index) => {
		if (el.id == id)
			userStore.user.invites.splice(index, 1)
	})
}

function filterUsers(): IOtherUserRestrict[] {
  return usersStore.userList.filter((user) => userStore.user.invites.find(el => el.id === user.id))
}

</script>

<template>
	<div class="invites" v-if="userStore.user.invites != undefined && userStore.user.invites.length > 0">
		<h3>Some new friends</h3>
		<div v-for="invite in filterUsers()" class="new_friend">
			<UserLink :other-user="invite" remove-img></UserLink>
			<button @click="resInvite(true, invite.id)">Accept</button>
			<button @click="resInvite(false, invite.id)">Refuse</button>
		</div>
	</div>
</template>

<style scoped>

.new_friend {
	display: flex;
}

.new_friend a {
	padding-right: 5px;
}


</style>