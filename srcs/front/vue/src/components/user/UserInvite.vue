<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import UserLink from './UserLink.vue';
import type { IOtherUserRestrict } from '@/types';

const userStore = useUserStore()
const usersStore = useUsersStore()

function resInvite(sayYes: boolean, id: number) {
	if (sayYes)
		userStore.acceptInvite(id)
	else
		userStore.refuseInvite(id)
	userStore.user.invites.forEach((el, index) => {
		if (el == id)
			userStore.user.invites.splice(index, 1)
	})
}

function filterUsers(): IOtherUserRestrict[] {
  return usersStore.userList.filter((user) => userStore.user.invites.find(el => el === user.id))
}

</script>

<template>
	<div class="invites" v-if="userStore.user.invites != undefined && userStore.user.invites.length > 0">
		<h3>Some new friends</h3>
		<div v-for="invite in filterUsers()" :key="invite.id" class="new_friend">
			<UserLink :other-user="invite" remove-img remove-status></UserLink>
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