<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useChannelsStore } from '@/stores/channels'
import Modal from '@/components/Modal.vue';

const channelsStore = useChannelsStore()
const userStore = useUserStore()
const usersStore = useUsersStore()
const showModal = ref(false)
const selectedUser = ref(0)
const formError = ref("")

function valid() {
	if (channelsStore.currentChan) {
		if (channelsStore.currentChan.canKickUser(userStore.user.id, selectedUser.value)) {
			channelsStore.emitKickUser(channelsStore.currentChan.getId(), selectedUser.value)
			cancel()
		}
		else
			formError.value = "You can't do that"
	}
}

function cancel() {
	selectedUser.value = 0
	formError.value = ""
	showModal.value = false
}

</script>

<template>
		<div>
			<button @click="showModal = true">
				Kick user
			</button>
			<Modal :show="showModal" @close="showModal = false" removeOK>
				<template #header>
					<h3>Kick a user</h3>
					<p class="red" v-if="formError.length > 0">{{ formError }}</p>
				</template>
				<template #body>
						<select v-model="selectedUser" v-if="channelsStore.currentChan">
							<option 
								v-for="user in channelsStore.currentChan.getUserList()"
								:key="user"
								:value="user"
							>
								{{ usersStore.getUserNickById(user) }}
							</option>
						</select>
					<button @click="valid()">Go !</button>
					<button @click="cancel()">Cancel</button>
				</template>
			</Modal>
		</div>
</template>