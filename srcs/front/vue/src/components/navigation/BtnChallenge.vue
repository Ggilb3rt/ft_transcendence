<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useStatusStore } from '../../stores/status'
import Modal from "@/components/Modal.vue"


const showModal = ref(false)
const gameType = ref("0")
const userStore = useUserStore()
const usersStore = useUsersStore()
const statusStore = useStatusStore()


async function selecteGameType() {
	await challenge()
	showModal.value = false
	console.log("le choix est : ", gameType.value)
}

async function challenge() {
    if (usersStore.user)
        statusStore.challengeUser(userStore.user.id, Number(gameType.value), usersStore.user.id)

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
		<button @click="showModal = true" v-if="!userStore.isBan(usersStore.user.id) && statusStore.socketIsAvailable(usersStore.user.id)">Challenge</button>
		<button @click="goSpectate()" v-else-if="!userStore.isBan(usersStore.user.id) && statusStore.socketIs(usersStore.user.id, 'inGame')">Spectate</button>
		<!-- <button @click="challenge()" v-else>Pouet</button> -->
		<Modal :show="showModal" @close="showModal = false" removeOK>
			<template #header>
				<h3>Select your game</h3>
			</template>
			<template #body>
				<select v-model="gameType" id="gameTypeSelector">
					<option value="0">Pong</option>
					<option value="1">FancyPong</option>
					<option value="2">Fong</option>
				</select>
				<button @click="selecteGameType()">Go !</button>
				<button @click="showModal = false">Cancel</button>
				{{ gameType }}
			</template>
		</Modal>
	</div>
</template>