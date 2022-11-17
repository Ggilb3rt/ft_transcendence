<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useUserStore } from '@/stores/user';
import { useChannelsStore } from '@/stores/channels'
import Modal from '@/components/Modal.vue';

const channelsStore = useChannelsStore()
const userStore = useUserStore()
const showModal = ref(false)
const newPass = ref("")
const formError = ref("")

function valid() {
	if (channelsStore.currentChan) {
		if (channelsStore.currentChan.canChangePass(userStore.user.id, newPass.value)) {
			channelsStore.emitPassChange(channelsStore.currentChan.getId(), newPass.value)
			cancel()
		}
		else
			formError.value = "You can't do that"
	}
}

function cancel() {
	newPass.value = ""
	formError.value = ""
	showModal.value = false
}

</script>

<template>
		<div>
			<button @click="showModal = true">
				Change password
			</button>
			<Modal :show="showModal" @close="showModal = false" removeOK>
				<template #header>
					<h3>Change password</h3>
					<p class="red" v-if="formError.length > 0">{{ formError }}</p>
				</template>
				<template #body>
						<p v-if="channelsStore.currentChan?.getType() == 'pass'">
							Set password
							<input type="text" v-model="newPass">
						</p>
					<button @click="valid()">Go !</button>
					<button @click="cancel()">Cancel</button>
				</template>
			</Modal>
		</div>
</template>