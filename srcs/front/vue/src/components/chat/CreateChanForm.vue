<script setup lang="ts">
import { ref, watch } from 'vue'
import type {TMessage, TChannelType, TRestrictUserTime, IChannel, IChannelRestrict} from '../../../typesChat'
import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';


const usersStore = useUsersStore()
const userStore = useUserStore()
const nameErr = ref(false)
const chanName = ref("")
const chanType = ref<TChannelType>("public")
const chanPass = ref("")
const chanPassConfirm = ref("")
const chanUserList = ref([])
let newChannel = ref<IChannel | {}>({})

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
		id: 99,
		name: chanName.value,
		type: chanType.value,
		pass: chanPass.value,
		owner: userStore.user.id,
		userList: chanUserList.value,
		adminList: [],
		banList: [],
		muteList: [],
		messages: []
	}
	newChannel.value = channelconst
	userStore.loading = false
}


</script>


<template>
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
				<select v-model="chanUserList" multiple>
					<option :value=user v-for="user in userStore.user.friends" :key="user">
						{{ usersStore.getUserNickById(user) }}
					</option>
				</select>
			</div>
			<button v-if="chanPass == chanPassConfirm || chanType != 'pass'" @click="sendCreateChan()">Create</button>
			<div @click="newChannel = {}">
				<p v-if="newChannel">{{ newChannel }}</p>
			</div>
		<hr>
		<h1>&lt-- Join one</h1>
		<h1>Or send direct message --&gt</h1>
	</div>
</template>


<style>
.create_chan_form {
	display: flex;
	flex-flow: column;
	align-self: flex-start;
	gap: 5px;
}
</style>