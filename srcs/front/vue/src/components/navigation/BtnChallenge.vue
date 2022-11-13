<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useStatusStore } from '../../stores/status'
import Modal from "@/components/Modal.vue"


const props = defineProps({
	userId: {type: Number, required: true},
})

const showModal = ref(false)
const gameType = ref(0)
const userStore = useUserStore()
const usersStore = useUsersStore()
const statusStore = useStatusStore()



async function selecteGameType() {
	await challenge()
	showModal.value = false
	//("le choix est : ", gameType.value)
}

async function challenge() {
    if (usersStore.user)
        statusStore.challengeUser(userStore.user.id, gameType.value, props.userId)

    if (usersStore.user && statusStore.socketIsAvailable(props.userId)) {
        //console.log(`challenge from ${userStore.user.id} to ${props.userId}`)
        // put invitation in a modal in the other side
    }
}

async function goSpectate() {
    if (usersStore.user && statusStore.socketIs(usersStore.user.id, 'inGame')) {
       // console.log("go to game with user ", usersStore.user.id)
    // fetch gameId from back
    // router.push(/game/${gameId})
    }
}

</script>

<template>
	<div class="anime" v-if="usersStore.getUserRestrictById(userId)">
		<div v-if="userStore.user.id != userId">
			<button @click="showModal = true" v-if="!userStore.isBan(userId) && statusStore.socketIsAvailable(userId)">Challenge</button>
			<button @click="goSpectate()" v-else-if="!userStore.isBan(userId) && statusStore.socketIs(userId, 'inGame')">Spectate</button>
		</div>
		<!-- <button @click="challenge()" v-else>Pouet</button> -->
		<Modal :show="showModal" @close="showModal = false" removeOK>
			<template #header>
				<h2>Challenge {{ usersStore.getUserNickById(userId) }}</h2>
				<h3>Select your game</h3>
			</template>
			<template #body>
				<select v-model="gameType" id="gameTypeSelector">
					<option value=0>Pong</option>
					<option value=1>FoxPong</option>
					<option value=2>Custom Pong</option>
				</select>
				<button @click="selecteGameType()">Go !</button>
				<button @click="showModal = false">Cancel</button>
				{{ gameType}}
			</template>
		</Modal>
	</div>
</template>


<style scoped>
h2 {
	color: var(--vt-c-black-mute);
}

.modal-leave-to {
    opacity: 0;
}

.anime .modal-leave-to .modal-container {
	-webkit-transform: translate(120%, -220%) scale(.1);
	transform: translate(120%, -220%) scale(.1);

}
</style>