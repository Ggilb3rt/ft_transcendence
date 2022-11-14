<script setup lang="ts">
import { ref, watch } from "vue"
import { useStatusStore } from '@/stores/status'
import { useUserStore} from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import Modal from "@/components/Modal.vue"

const userStore = useUserStore()
const usersStore = useUsersStore()
const statusStore = useStatusStore()

function acceptChallenge() {
	statusStore.acceptChallenge()
	statusStore.challenge = null
}

function refuseChallenge() {
	statusStore.refuseChallenge(userStore.user.id)
}

</script>

<template>
		<Modal v-if="!statusStore.challengeAccepted && statusStore.challenge && statusStore.challenge.challenged == userStore.user.id" :show="!statusStore.challengeAccepted" removeOK>
			<template #header>
				<h2>Challenged by {{ statusStore.challenge.challenger }}</h2>
				<h3>Relever le défi ?</h3>
			</template>
			<template #body>
				<button @click="acceptChallenge()">Go !</button>
				<button @click="refuseChallenge()">Cancel</button>
			</template>
		</Modal>
</template>
