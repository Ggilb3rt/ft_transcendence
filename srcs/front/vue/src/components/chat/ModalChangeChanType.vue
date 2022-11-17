<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useUserStore } from '@/stores/user';
import { useChannelsStore } from '@/stores/channels'
import Modal from '@/components/Modal.vue';
import type { TChannelType } from '../../../typesChat';

const channelsStore = useChannelsStore()
const userStore = useUserStore()
const showModal = ref(false)
const newChannelType = ref<TChannelType>("public")
const newPass = ref("")
const formError = ref("")

if (channelsStore.currentChan)
	newChannelType.value = channelsStore.currentChan.getType()

function valid() {
	if (channelsStore.currentChan) {
		if (channelsStore.currentChan.canChangeType(userStore.user.id, newChannelType.value, newPass.value)) {
			channelsStore.emitTypeChange(channelsStore.currentChan.getId(), newChannelType.value, newPass.value)
			cancel()
		}
	else
		formError.value = "You can't do that"
	}
}

function cancel() {
	newChannelType.value = "public"
	newPass.value = ""
	formError.value = ""
	showModal.value = false
}

</script>

<template>
		<div>
			<button @click="showModal = true">
				Change channel Type
			</button>
			<Modal :show="showModal" @close="showModal = false" removeOK>
				<template #header>
					<h3>Change channel Type</h3>
					<p class="red" v-if="formError.length > 0">{{ formError }}</p>
				</template>
				<template #body>
						<select v-model="newChannelType" v-if="channelsStore.currentChan">
							<option value="public">public</option>
							<option value="private">private</option>
							<option value="pass">protected</option>
						</select>
						<p v-if="newChannelType == 'pass'">
							Set password
							<input type="text" v-model="newPass">
						</p>
					<button @click="valid()">Go !</button>
					<button @click="cancel()">Cancel</button>
				</template>
			</Modal>
		</div>
</template>