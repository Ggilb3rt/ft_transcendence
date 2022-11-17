<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useUserStore } from '@/stores/user';
import { useChannelsStore } from '@/stores/channels'
import Modal from '@/components/Modal.vue';
import { watch } from '@vue/runtime-core';

const channelsStore = useChannelsStore()
const userStore = useUserStore()
const showModal = ref(false)
const needPass = ref("")
const formError = ref("")

function valid() {
	const channelId = channelsStore.error
	let splitedError: string[] = channelId.split('/')
	let finalId: number

	if (needPass.value.length == 0)
		formError.value = "Give the password !"
	if (splitedError.length > 1) {
		formError.value = ""
		finalId = parseInt(splitedError[1])
		channelsStore.emitJoin(finalId, needPass.value)
		cancel()
	}
}

function cancel() {
	needPass.value = ""
	formError.value = ""
	channelsStore.error = ""
	showModal.value = false
}

watch(channelsStore, (newVal) => {
	if (newVal.error.length > 0)
		showModal.value = Boolean(channelsStore.error.includes('pass'))
})

</script>

<template>
		<div>
			<Modal :show="showModal" removeOK>
				<template #header>
					<h3>Need password</h3>
					<p class="red" v-if="formError.length > 0">{{ formError }}</p>
				</template>
				<template #body>
						<p>
							<input type="text" v-model="needPass">
						</p>
					<button @click="valid()">Go !</button>
					<button @click="cancel()">Cancel</button>
				</template>
			</Modal>
		</div>
</template>