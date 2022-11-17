<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useStatusStore } from '../../stores/status'
import Modal from "@/components/Modal.vue"
import MdiSwordCross from "@/components/icones-bags/MdiSwordCross.vue"



const props = defineProps({
  userId: { type: Number, required: true },
});

const showModal = ref(false);
const gameType = ref(0);
const userStore = useUserStore();
const usersStore = useUsersStore();
const statusStore = useStatusStore();

function userIsAvailable() {
	if (statusStore.status === "available") {
		return true;
	}
	return false;
}

async function selecteGameType() {
  await challenge();
  showModal.value = false;
}

async function challenge() {
	if (userStore.user)
		statusStore.challengeUser(userStore.user.id, gameType.value, props.userId)
}

</script>

<template>
	<div class="anime" v-if="usersStore.getUserRestrictById(userId)">
		<div v-if="userStore.user.id != userId">
			<button id="btn_challenge" @click="showModal = true" v-if="!userStore.isBan(userId) && statusStore.socketIsAvailable(userId)">
				<MdiSwordCross></MdiSwordCross>
			</button>
			<!-- <button @click="goSpectate()" v-else-if="!userStore.isBan(userId) && statusStore.socketIs(userId, 'inGame')">Spectate</button> -->
		</div>
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

/* #btn_challenge:hover {
	transform: scale(1.05);
	animation: whao 0.5s infinite alternate ease-out;
} */


</style>
