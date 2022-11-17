<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useChannelsStore } from '@/stores/channels'
import Modal from '@/components/Modal.vue';
import CarbonClose from '@/components/icones-bags/CarbonClose.vue'

const channelsStore = useChannelsStore()
const userStore = useUserStore()
const usersStore = useUsersStore()
const showRestrictUserModal = ref<boolean>(false)
const selectedUser = ref<number>(0)
const isMute = ref<boolean>(false)
const timeDate = ref<string>("")
const formError = ref<string>("")

function valid() {
	if (channelsStore.currentChan) {
		if (channelsStore.currentChan.canRestrictUser(userStore.user.id, selectedUser.value, isMute.value)) {
				channelsStore.emitRestrictUser(
					isMute.value,
					channelsStore.currentChan.getId(),
					selectedUser.value,
					timeDate.value
				)
			cancel()
	}
	else
		formError.value = "You can't do that"
	}
}

function cancel() {
	selectedUser.value = 0
	isMute.value = false
	timeDate.value = ""
	formError.value = ""
	showRestrictUserModal.value = false
}

</script>

<template>
		<div>
			<button @click="showRestrictUserModal = true">
				Restrict user
			</button>
			<Modal :show="showRestrictUserModal" @close="showRestrictUserModal = false" removeOK>
				<template #header>
					<h3>Restrict a user</h3>
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
						<select v-model="isMute">
								<option value=false>Ban</option>
								<option value=true>Mute</option>
						</select>
						<p>
							<span v-if="isMute">Mute</span>
							<span v-else>Ban</span>
							<input type="datetime-local" v-model="timeDate">
							<!-- <input type="number" v-model="minuteToAdd" :max="minutesInOneYear"> minutes -->
						</p>
						<br>
						<p v-if="selectedUser && timeDate.length > 0">
							{{ usersStore.getUserNickById(selectedUser) }} will be {{ isMute ? "muted" : "banned" }} until {{ timeDate }}
						</p>
					<button @click="valid()">Go !</button>
					<button @click="cancel()">Cancel</button>
				</template>
			</Modal>
		</div>
</template>