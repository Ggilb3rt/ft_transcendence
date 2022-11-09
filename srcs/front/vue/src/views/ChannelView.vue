<script setup lang="ts">
import { ref, onUpdated, onBeforeMount, onMounted } from 'vue'
import type {TMessage, TChannelType, TRestrictUserTime, IChannel, IChannelRestrict} from '../../typesChat'
import type {IOtherUserRestrict} from '../../types'
import { useUserStore } from "@/stores/user"
import { useUsersStore } from '@/stores/users'
import { useChannelsStore } from '@/stores/channels'
import BtnChallenge from '@/components/navigation/BtnChallenge.vue'
import UserLink from '@/components/user/UserLink.vue'
import AdminPanel from '@/components/chat/AdminPanel.vue'
import { CChannel } from '@/helpers/class.channel'

const props = defineProps({
	channelId: {type: String, required: true},
	direct: {type: Boolean, required: true},
})

const channelIdNumber = Number(props.channelId)
const userStore = useUserStore()
const usersStore = useUsersStore()
const channelsStore = useChannelsStore()
let msg = ref("")


// ChannelView need to
	// getChannel(x)
	// print his msg
	// sendNewMessages
	// manage users

// async function getChannel(id: number) {
// 	const res = await fetch(`localhost:3000/channel/${id}`, {credentials: "include"})
// }

let currentChan = new CChannel(channelIdNumber, "Lol", "public", "", 9, [7, 8, 9], [9], [], [], [])

// need to getMessages from channel(props.channelId)
let channelMsgs: TMessage[] = [
		{
			sender: 8,
			receiver: channelIdNumber,
			msg: "lol",
			isDirect: props.direct,
			date: new Date()
		},
		{
			sender: 9,
			receiver: channelIdNumber,
			msg: "pouet un message tres long pour voir ce que ca fait tout autour, poour pousser le btn challenge et l'img",
			isDirect: props.direct,
			date: new Date()
		},
		{
			sender: userStore.user.id,
			receiver: channelIdNumber,
			msg: "internet",
			isDirect: props.direct,
			date: new Date()
		},
]


function submit(e: Event) {
	e.preventDefault()
	// fetch to server
	if (msg.value != "") {
		channelMsgs.push({
			sender: userStore.user.id,
			receiver: channelIdNumber,
			msg: msg.value,
			isDirect: props.direct,
			date: new Date()
		})
		if (channelsStore.currentChan) {
			channelsStore.currentChan.sendMessage({
				sender: userStore.user.id,
				receiver: channelIdNumber,
				msg: msg.value,
				isDirect: props.direct,
				date: new Date()
			})
		}
	}
	msg.value = ""
}

onBeforeMount(() => {
	// fetch Channel
	channelsStore.selectCurrentChan(channelIdNumber)
})

onMounted(() => {
	// emit('im-mounted')
})

onUpdated(() => {
	const room = document.getElementById('room-view')
	if (room) {
		room.scrollTo({
			top: room.scrollHeight,
			left: 0,
			behavior: 'smooth'
		});
	}
})

</script>

<template>
	<div class="room" v-if="channelsStore.currentChan">
		<p>
			<span v-if="props.direct">/direct/</span>{{ props.channelId }}
		</p>
		<AdminPanel></AdminPanel>
		<div class="chatRoom" id="room-view">
			<div v-for="msg in channelsStore.currentChan.messages" :key="usersStore.getUserNickById(msg.sender)" class="message-wrapper">
				<div v-if="!userStore.isBan(msg.sender)" class="message">
					<figure>
						<UserLink :other-user="usersStore.getUserRestrictById(msg.sender)" remove-status remove-name remove-hover></UserLink>
					</figure>
					<p>
						<span class="tag">
							{{ usersStore.getUserNickById(msg.sender) }}
							<span v-if="currentChan.isBan(msg.sender)"> (is ban)</span>
							<span v-if="currentChan.isMute(msg.sender)"> (is mute)</span>
						</span> |
						<span class="time"> {{ msg.date.toLocaleDateString('fr-fr') }} {{ msg.date.getHours() }}:{{ (msg.date.getMinutes() < 10) ? '0' + String(msg.date.getMinutes()) : msg.date.getMinutes() }}</span>
						<br>
						<span>{{ msg.msg }}</span>
					</p>
					<BtnChallenge :user-id="msg.sender"></BtnChallenge>
				</div>
				<div v-else class="message">
					<p>You banned this user</p>
				</div>
			</div>
			<form v-if="!channelsStore.currentChan.isBan(userStore.user.id) && !channelsStore.currentChan.isMute(userStore.user.id) ">
				<textarea v-model="msg" @keyup.enter="submit"></textarea>
				<button @click="submit" class="send">Send</button>
			</form>
		</div>
	</div>
</template>


<style>


.room {
	align-self: flex-start;
	width: 100%;
	height: calc(90vh - 89px);
	overflow: scroll;
	padding: 0px;
	position: relative;
}

.room:hover ::-webkit-scrollbar {
	width: 5px;
}

.room:hover .chatRoom .message{
	padding: 10px 15px 10px 20px;
}

.room .chatRoom {
	width: 100%;
	height: 100%;
	overflow: auto;
	scrollbar-color: var(--global-c-blue);
	scrollbar-width: thin;
}

.room .message .tag {
	color: var(--global-c-blue);
	font-size: .8em;
}

.room .message .time {
	/* color: var(--color-background-soft); */
	font-size: .8em;
}

.room .message-wrapper:nth-child(2n) {
	background: var(--color-background-mute);
}
.room .message {
	padding: 10px 20px;
	display: flex;
	gap: 0px 20px;
	word-break: break-all;
}

.room .message figure {
	min-width: 50px;
	align-self: center;
}

/* .room .message p {
	flex-grow: 2;
} */

.room .message img{
	max-width: 50px;
	min-height: 50px;
	max-height: 50px;
	object-fit: cover;
	/* border-radius: 50px; */
}

.room form {
	position: fixed;
	bottom : 10px;
	z-index: 9;
	display: grid;
	grid-template-columns: 4fr 1fr;
}

.room form textarea {
	resize: none;
	min-height: 50px;
	max-height: 500px;
	/* min-width: 80vw;
	max-width: 80vw; */
}

.room form input[type='submit'] {
	width: 20vw;
	height: 50px;
}



@media screen and (min-width: 768px) {
	.room {
		flex-grow: 1;
	}

	.room form {
		width: 70vw;
	}
	.room form textarea {
	min-height: 50px;
	max-height: 500px;
	/* min-width: 70%;
	max-width: 70%; */
}

	.room form input[type='submit'] {
		/* width: 20%; */
		height: 50px;
	}
}

@media screen and (min-width: 1024px) {

}





</style>