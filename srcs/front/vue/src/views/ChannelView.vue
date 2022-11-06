<script setup lang="ts">
import { ref, onUpdated, onBeforeMount } from 'vue'
import type {TMessage, TChannelType, TRestrictUserTime, IChannel, IChannelRestrict} from '../../typesChat'
import { useUserStore } from "@/stores/user"
import { useUsersStore } from '@/stores/users'
import BtnChallenge from '@/components/navigation/BtnChallenge.vue'
import { remove } from '@vue/shared'

const props = defineProps({
	channelId: {type: String, required: true},
	direct: {type: Boolean, required: true}
})

const userStore = useUserStore()
const usersStore = useUsersStore()
let msg = ref("")


// ChannelView need to
	// getChannel(x)
	// print his msg
	// sendNewMessages
	// manage users

class CChannel implements IChannel {
	id: number;
	ChanName: string;
	type: TChannelType;
	pass: string;
	owner: number | null;
	userList: number[];
	adminList: number[];
	banList: TRestrictUserTime[];
	muteList: TRestrictUserTime[];
	messages: TMessage[];
	passMinLength: number;

	constructor(id: number) {
		this.ChanName = "";
		this.id = id;
		this.type = "public";
		this.pass = "";
		this.owner = null;
		this.userList = [];
		this.adminList = [];
		this.banList = [];
		this.muteList = [];
		this.messages = [];
		this.passMinLength = 5;
	}

	// Helpers
	addMinutes(date: Date, minutes: number) {
		const dateCopy = new Date(date);
		dateCopy.setMinutes(date.getMinutes() + minutes);

		return dateCopy;
	}
	async checkWithServer(url: string, option: Object): Promise<boolean> {
		const res = await fetch(url, { credentials: "include"})
		return false
	}

	// Getters
	getName(): string { return this.ChanName }
	getType(): string { return this.type }
	getMessages(): TMessage[] { return this.messages }
	// Checkers
	isPassValid(testString: string): boolean { return this.pass == testString }
	isInChannel(userId:number): boolean { return this.userList.find(el => el == userId) ? true : false }
	isOwner(userId:number): boolean { return userId == this.owner ? true : false }
	isAdmin(userId:number): boolean { return this.adminList.find(el => el == userId) ? true : false }
	isMute(userId:number): boolean { return this.muteList.find(el => el.userId == userId) ? true : false }
	endOfMute(userId:number): Date | null {
			const mutedUser: TRestrictUserTime | undefined = this.muteList.find(el => el.userId == userId)
			return mutedUser ? mutedUser.expire : null
	}
	isBan(userId:number): boolean { return this.banList.find(el => el.userId == userId) ? true : false}
	endOfBan(userId:number): Date | null {
		const banedUser: TRestrictUserTime | undefined = this.banList.find(el => el.userId == userId)
		return banedUser ? banedUser.expire : null
	}
	// Setters
	joinChannel(userId:number, channelId:number): TMessage[] | null {
		if (!this.isInChannel(userId) && !this.isBan(userId)) {
			// check with server
			this.userList.push(userId)
			return this.messages
		}
		return null
	}
		// leaveChannel(userId:number): boolean {
		// 		// check user is in this.userList
		// 			// remove userId from this.userList
		// 			// return true
		// 	// return false
		// }
	renameChannel(userId:number, newName:string): boolean {
		if (this.isOwner(userId)) {
			if (this.ChanName == newName) {
				// check with server
				this.ChanName = newName
				return true
			}
		}
		return false
	}
	changeChannelType(userId:number, newType:TChannelType, pass?:string): boolean {
		if (this.isOwner(userId)) {
			if (newType != this.getType()) {
				if (newType == "pass" && pass && pass.length > this.passMinLength) {
					// check with server
					this.type = newType
					this.pass = pass
					return true
				}
				else if (newType == "direct")
					return false
				else {
					// check with server
					this.type = newType
					return true
				}
			}
		}
		return false
	}
	changePass(userId:number, newPass:string): boolean {
		if (this.isAdmin(userId) && this.getType() == "pass") {
			if (this.pass != newPass && newPass.length > this.passMinLength) {
				// check with server
				this.pass = newPass
				return true
			}
		}
		return false
	}
	addAdmin(nominator:number, nominated:number): boolean {
		if (this.isAdmin(nominator) && !this.isAdmin(nominated)) {
			// check with server
			this.adminList.push(nominated)
			return true
		}
		return false
	}
	removeAdmin(remover:number, removed:number, channelId:number): boolean {
		if (remover != removed && this.isOwner(remover) && this.isAdmin(removed) && removed != this.owner) {
			// check with server
			const find = this.adminList.findIndex(el => el == removed)
			this.adminList.splice(find, 1)
			return true
		}
		return false
	}
	restrictUser(restrictor:number, restricted:number, onlyMute: boolean, timeInMinutes:number): boolean {
		if (this.isAdmin(restrictor) && !this.isOwner(restricted) && restricted != restrictor) {
			// check with server
			const restrict: TRestrictUserTime = {
				userId: restricted,
				expire: this.addMinutes(new Date(), timeInMinutes)
			}
			if (onlyMute) {
				this.muteList.push(restrict)
				return true
			}
			else {
				this.banList.push(restrict)
				return true
			}
		}
		return false
	}
}


// async function getChannel(id: number) {
// 	const res = await fetch(`localhost:3000/channel/${id}`, {credentials: "include"})
// }


onBeforeMount(() => {
	// fetch Channel
	console.log("pouet")
})

// need to getMessages from channel(props.channelId)
let channelMsgs: TMessage[] = [
		{
			sender: 8,
			reciever: Number(props.channelId),
			msg: "lol",
			isDirect: props.direct,
			date: new Date()
		},
		{
			sender: 8,
			reciever: Number(props.channelId),
			msg: "pouet",
			isDirect: props.direct,
			date: new Date()
		},
		{
			sender: userStore.user.id,
			reciever: Number(props.channelId),
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
			reciever: Number(props.channelId),
			msg: msg.value,
			isDirect: props.direct,
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
			<div v-for="msg in channelMsgs" :key="usersStore.getUserNickById(msg.sender)" class="message-wrapper">
				<div v-if="!userStore.isBan(msg.sender)" class="message">
					<figure>
						<img :src="usersStore.getUserAvatarById(msg.sender)" :alt="usersStore.getUserNickById(msg.sender) + ' avatar'">
						<BtnChallenge></BtnChallenge>
					</figure>
					<p>
						<span class="tag">{{ usersStore.getUserNickById(msg.sender) }}</span> | 
						<span class="time"> {{ msg.date.toLocaleDateString('fr-fr') }} {{ msg.date.getHours() }}:{{ (msg.date.getMinutes() < 10) ? '0' + String(msg.date.getMinutes()) : msg.date.getMinutes() }}</span>
						<br>
						<span>{{ msg.msg }}</span>
					</p>
				</div>
				<div v-else class="message">
					<p>You ban this user</p>
				</div>
			</div>
			<form>
				<textarea v-model="msg" @keyup.enter="submit"></textarea>
				<button @click="submit" class="send">Send</button>
				<!-- <input type="submit" class="send" @click="submit"> -->
			</form>
		</div>
	</div>
</template>


<style scoped>


.room {
	align-self: flex-start;
	width: 100%;
	height: calc(90vh - 89px);
	overflow: scroll;
	padding: 0px;
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

.room .message img{
	max-width: 50px;
	min-height: 50px;
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