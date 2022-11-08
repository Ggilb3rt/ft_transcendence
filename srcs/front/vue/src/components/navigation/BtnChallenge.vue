<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useStatusStore } from '../../stores/status';

const userStore = useUserStore()
const usersStore = useUsersStore()
const statusStore = useStatusStore()


async function challenge() {
    if (usersStore.user)
        statusStore.challengeUser(userStore.user.id, 0, usersStore.user?.id)

    if (usersStore.user && statusStore.socketIsAvailable(usersStore.user.id)) {
        console.log(`challenge from ${userStore.user.id} to ${usersStore.user.id}`)
        // put invitation in a modal in the other side
    }
}

async function goSpectate() {
    if (usersStore.user && statusStore.socketIs(usersStore.user.id, 'inGame')) {
        console.log("go to game with user ", usersStore.user.id)
    // fetch gameId from back
    // router.push(/game/${gameId})
    }
}

</script>

<template>
	<div v-if="usersStore.user">
		<button @click="challenge()" v-if="!userStore.isBan(usersStore.user.id) && statusStore.socketIsAvailable(usersStore.user.id)">Challenge</button>
		<button @click="goSpectate()" v-else-if="!userStore.isBan(usersStore.user.id) && statusStore.socketIs(usersStore.user.id, 'inGame')">Spectate</button>
		<!-- <button @click="challenge()" v-else>Pouet</button> -->
	</div>
</template>