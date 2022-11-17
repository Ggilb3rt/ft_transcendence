<script setup lang="ts">
import { ref, watch } from 'vue'
import router from '@/router';
import type {TMessage, TChannelType, TRestrictUserTime, IChannel, IChannelRestrict} from '../../../typesChat'
import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';
import { useChannelsStore } from '@/stores/channels';
import CarbonArrowLeft from "@/components/icones-bags/CarbonArrowLeft.vue"
import CarbonArrowRight from "@/components/icones-bags/CarbonArrowRight.vue"
import { CChannel } from '@/helpers/class.channel';


const usersStore = useUsersStore()
const userStore = useUserStore()
const channelsStore = useChannelsStore()

const nameErr = ref(false)
const chanName = ref("")
const chanType = ref<TChannelType>("public")
const chanPass = ref("")
const chanPassConfirm = ref("")
const chanUserList = ref([])
let newChannel = ref<IChannel>()

watch(chanType, (newChanType) => {
	chanPass.value = ""
	chanPassConfirm.value = ""
	chanUserList.value = []
})

function isPassNeeded(): boolean {
	return chanType.value == "pass" ? true : false
}
function isPassValid(): boolean {
	if (chanPass.value == chanPassConfirm.value && chanPass.value.length >= 5)
		return true
	return false
}

async function sendCreateChan() {
	if (chanName.value.length == 0) {
		nameErr.value = true
		return
	}
	if (isPassNeeded()) {
		if (!isPassValid())
			return
	}
	nameErr.value = false
	userStore.loading = true
	//fetch
	let channelconst: IChannel = {
		ChanName: chanName.value,
		type: chanType.value,
		pass: chanPass.value,
		owner: userStore.user.id,
		userList: chanUserList.value,
		adminList: [],
		banList: [],
		muteList: [],
		messages: []
	}

	try {
		const response = await fetch(`http://localhost:3000/channels/`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({channel: channelconst}),
			credentials: "include"
		})
		var data;
		if (response.status >= 200 && response.status < 300) {
			data = await response.json()
		}
		else {
			throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
		}
		if (data) {
			newChannel.value = data
			if (newChannel.value)
				await channelsStore.createChan(newChannel.value)
		}
	} catch (error: any) {
		const tempErr = JSON.parse(error.message)
		channelsStore.error = tempErr.body
	} finally {
		userStore.loading = false
	}
}


</script>


<template>
	<div class="create_chan_form_wrapper">
		<div class="create_chan_form">
			<h1>Create a new channel</h1>
				<input type="text" v-model="chanName" placeholder="channel name" autocomplete="off">
				<p class="error red" v-if="nameErr">Invalide name</p>
				<select v-model="chanType">
						<option>public</option>
						<option>private</option>
						<option value="pass">password</option>
				</select>
				<div v-if="chanType == 'pass'">
					<input type="password" v-model="chanPass" placeholder="channel password" autocomplete="off">
					<input type="password" v-model="chanPassConfirm" placeholder="confirm" autocomplete="off">
					<p class="error red" v-if="chanPass != chanPassConfirm">Not same password</p>
					<p class="error red" v-if="chanPass.length < 5">Need at least 5 characters</p>
				</div>
				<p v-if="chanType == 'private'">Add some of your friends on this channel</p>
				<div v-if="chanType == 'private'">
					<select v-model="chanUserList" multiple v-if="userStore.user.friends.length > 0">
						<option :value=user v-for="user in userStore.user.friends" :key="user">
							{{ usersStore.getUserNickById(user) }}
						</option>
					</select>
					<p v-else>You need friends</p>
				</div>
				<button v-if="chanPass == chanPassConfirm || chanType != 'pass'" @click="sendCreateChan()">Create</button>
		</div>
	</div>
</template>


<style>
.create_chan_form_wrapper {
	padding: 20px;
}

.create_chan_form {
	display: flex;
	flex-flow: column;
	align-self: center;
	gap: 5px;
}

h3 {
	display: inline-flex;
	align-items: center;
}

@media screen and (min-width: 768px) {
	.create_chan_form_wrapper {
		width: 60vw;
		padding: 10px 10vw;
	}
	.create_chan_form {
		align-self: flex-start;
	}
}

</style>