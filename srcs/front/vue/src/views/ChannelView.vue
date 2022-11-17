<script setup lang="ts">
import { ref, onUpdated, onBeforeMount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
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
const route = useRoute()
let msg = ref("")



	
	
	
	





function submit(e: Event) {
	e.preventDefault()
	
	if (msg.value != "") {
		if (channelsStore.currentChan)
			if (channelsStore.currentChan.getType() != "direct") {
				if (channelsStore.currentChan.canSendMessage(userStore.user.id))
					channelsStore.emitMessage(channelIdNumber, msg.value)
			}
			else {
				channelsStore.emitDirectMessage(channelIdNumber, msg.value)
			}
			
				
		
		
		
		
		
		
		
		
		
	}
	msg.value = ""
}

onBeforeMount(async() => {
    const isDirectMsg = route.name == "channelDirect" ? true : false
    if (isDirectMsg) {
        await channelsStore.getDirectChan(channelIdNumber)
        channelsStore.selectCurrentChan(channelIdNumber, true)
    }
    else {
        await channelsStore.getChan(channelIdNumber)
        channelsStore.selectCurrentChan(channelIdNumber, false)
    }
})

onMounted(() => {
	
	

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
	<div class="room" v-if="channelsStore.currentChan && !channelsStore.currentChan.isBan(userStore.user.id) && channelsStore.currentChan.isInChannel(userStore.user.id)">
		<div class="chatRoom" id="room-view">
			<div v-for="msg in channelsStore.currentChan.messages" :key="usersStore.getUserNickById(msg.sender)" class="message-wrapper">
				<!-- if msg.sender < 0 ===> print as server info -->
				<div v-if="msg.sender < 0" class="message robot-message">
					{{ msg.msg }}
				</div>
				<div v-else-if="!userStore.isBan(msg.sender)" class="message" :class="{me: msg.sender == userStore.user.id}">
					<figure>
						<UserLink :other-user="usersStore.getUserRestrictById(msg.sender)" remove-status remove-name remove-hover></UserLink>
					</figure>
					<p>
						<span class="tag">
							{{ usersStore.getUserNickById(msg.sender) }}
							<span v-if="channelsStore.currentChan.isBan(msg.sender)"> (is ban)</span>
							<span v-if="channelsStore.currentChan.isMute(msg.sender)"> (is mute)</span>
						</span> |
						<!-- <span class="time"> {{ msg.date }} (pas de type date)</span> -->
						<span class="time" v-if="msg.date"> {{ msg.date.toLocaleDateString('fr-fr') }} {{ msg.date.getHours() }}:{{ (msg.date.getMinutes() < 10) ? '0' + String(msg.date.getMinutes()) : msg.date.getMinutes() }}</span>
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
	<div class="room" v-else>
		<h2>Nothing to see here</h2>
	</div>
</template>


<style>


.room {
	align-self: flex-start;
	width: 100%;
	height: calc(90vh - 89px);
	overflow-y: scroll;
	overflow-x: hidden;
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

.room .robot-message {
	background: var(--global-c-blue-hover);
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

/* .room .message-wrapper:nth-child(2n) .message{
	flex-flow: row-reverse;
} */
/* .room .message.me {
	flex-flow: row-reverse;
} */

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
	width: 100%;
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