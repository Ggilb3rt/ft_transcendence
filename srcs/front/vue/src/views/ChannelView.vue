<script setup lang="ts">
import { ref, onUpdated } from 'vue'
import BtnChallenge from '@/components/navigation/BtnChallenge.vue'
import type {TMessage, TChannelType, TRestrictUserTime, IChannel, IChannelRestrict} from '../../typesChat'

const props = defineProps({
	channelId: {type: String, required: true},
	direct: {type: Boolean, required: true}
})
let msg = ref("")


// ChannelView need to
	// getChannel(x)
	// print his msg
	// sendNewMessages
	// manage users

// need to getMessages from channel(props.channelId)
let channelMsgs: TMessage[] = [
		{
			tag: "Roger",
			img: "../../src/assets/avatars/rogerRabbit.png",
			msg: "Bonjour",
			date: new Date()
		},
		{
			tag: "Homer",
			img: "../../src/assets/avatars/homer.jpeg",
			msg: "Bonjour",
			date: new Date()
		},
		{
			tag: "Homer",
			img: "../../src/assets/avatars/homer.jpeg",
			msg: "J'adore les pommes",
			date: new Date()
		},
]


function submit(e: Event) {
	e.preventDefault()
	// fetch to server
	if (msg.value != "") {
		channelMsgs.push({
			tag: "Homer",
			img: "src/assets/avatars/homer.jpeg",
			msg: msg.value,
			date: new Date()
		})
	}
	msg.value = ""
}

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
	<div class="room">
		<p>
			<span v-if="props.direct">/direct/</span>{{ props.channelId }}
		</p>
		<div class="chatRoom" id="room-view">
			<div v-for="msg in channelMsgs" :key="msg.tag" class="message">
				<figure>
					<img :src="msg.img" :alt="msg.tag + ' avatar'">
					<BtnChallenge></BtnChallenge>
				</figure>
				<p>
					<span class="tag">{{ msg.tag }}</span> | 
					<span class="time"> {{ msg.date.toLocaleDateString('fr-fr') }} {{ msg.date.getHours() }}:{{ (msg.date.getMinutes() < 10) ? '0' + String(msg.date.getMinutes()) : msg.date.getMinutes() }}</span>
					<br>
					<span>{{ msg.msg }}</span>
				</p>
			</div>
			<form @keyup.enter="submit">
				<textarea v-model="msg"></textarea>
				<input type="submit" class="send" @click="submit">
			</form>
		</div>
	</div>
</template>


<style scoped>


.room {
	align-self: flex-start;
	width: 100%;
	height: calc(90vh - 126px);
	overflow: hidden;
	/* padding: 20px; */
}

.room:hover ::-webkit-scrollbar {
	width: 5px;
}

.room:hover .chatRoom .message{
	padding: 10px 15px 10px 20px;
}

.room .chatRoom {
	width: 100%;
	height: 99%;
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

.room .message:nth-child(2n) {
	background: var(--color-background-mute);
}
.room .message {
	padding: 10px 20px;
	display: flex;
	gap: 0px 20px;
	word-break: break-all;
}

.room .message img{
	max-width: 50px;
	min-height: 50px;
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