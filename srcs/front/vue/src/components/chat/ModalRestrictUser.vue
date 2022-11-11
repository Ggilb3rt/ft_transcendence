<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useChannelsStore } from '@/stores/channels'
import Modal from '@/components/Modal.vue';
import CarbonClose from '@/components/icones-bags/CarbonClose.vue'

const minutesInOneYear: number = 525960
const channelsStore = useChannelsStore()
const userStore = useUserStore()
const usersStore = useUsersStore()
const showRestrictUserModal = ref(false)
const selectedUser = ref(0)
const isMute = ref(false)
const minuteToAdd = ref(0)
const formError = ref("")

function valid() {
	console.log('minuteToAdd == ', minuteToAdd.value)
	if (channelsStore.currentChan && minuteToAdd.value <= minutesInOneYear) {
		if (channelsStore.currentChan.restrictUser(userStore.user.id, selectedUser.value, isMute.value, minuteToAdd.value)) {
			if (minuteToAdd.value > 0) {
				channelsStore.emitRestrictUser(
					isMute.value,
					channelsStore.currentChan.getId(),
					selectedUser.value,
					minuteToAdd.value
				)
			}
			else {
				channelsStore.emitRestrictUser(
					isMute.value,
					channelsStore.currentChan.getId(),
					selectedUser.value
				)
			}
			console.log("send restrict user ", selectedUser.value, isMute.value, minuteToAdd.value)
			cancel()
		}
		else
			formError.value = "You can't do that"
	}
}

function cancel() {
	selectedUser.value = 0
	isMute.value = false
	minuteToAdd.value = 0
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
							<input type="number" v-model="minuteToAdd" :max="minutesInOneYear"> minutes
						</p>
					<button @click="valid()">Go !</button>
					<button @click="cancel()">Cancel</button>
				</template>
			</Modal>
		</div>
</template>