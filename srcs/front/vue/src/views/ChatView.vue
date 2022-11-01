<script setup lang="ts">
import { ref, onUpdated } from 'vue'
import SideNav from '../components/navigation/SideNav.vue';
import BtnChallenge from '@/components/navigation/BtnChallenge.vue'


/*
 * Routes for the back

	// channels types : cf TChannel below; if channel.type == "direct" nobody is owner nor admin, if you want to ban direct channel just ban the user

	// Global
		getAllChannels(userId:number, ??myBans:[number]??): [IChannel] {} (myBans est util uniquement pour ne pas avoir les direct msg, pas forcement util ici)
		??getAllDirectMessages(userId:number, myBans:[number]): [IChannel] {} (pas sûr que cette function soit utile)
		??getMyChannels(userId:number): [IChannel] {}

	// Dans un channel
		createChannel(userId(number), channelName:string, channelType:TChannel, pass?:string) : boolean {
			// owner is userId
		}
		getMessages(userId:number, channelId:number) : [IMessage] {
			// userId must be in channelId && !isBan(userId)
		}

		isOwner(userId:number): boolean {}
		isAdmin(userId:number): boolean {}
		isMute(userId:number): boolean {}
		endOfMute(userId:number): Date {} (soit ça soit isMute() return directement la Date ?)
		isBan(userId:number): Date {}

		// Devra probablement se passer via sockets (?)
			joinChannel(userId:number, channelId:number): [IMessage] {}
			leaveChannel(userId:number, channelId:number): boolean {}
			renameChannel(userId:number, channelId:number, newName:string): boolean {
				// must be owner
			}
			changeChannelType(userId:number, channelId:number, newType:TChannel, pass?:string): boolean {
				// must be owner
			}
			changePass(userId:number, channelId:number, newPass:string): boolean {
				// must be owner
			}
			addAdmin(nominator:number, nominated:number, channelId:number): boolean {
				// must be at least admin
			}
			removeAdmin(remover:number, channelId:number): boolean {
				// must be owner ?
			}
			restrictUser(restrictor:number, restricted:number, channelId:number, onlyMute: boolean): boolean {
				// must be at least admin
			}

*/




type TChannel = "public" | "private" | "pass" | "direct"

interface IRestrictUserTime {
	userId: number;
	expire: Date;
}

interface IChannel {
	id: number;
	// href: string; // equivalent of id ??
	name: string;
	type: TChannel;
	userList: [number];
	channelOwner: number | null;
	adminList: [number];
	banList: [IRestrictUserTime];
	muteList: [IRestrictUserTime];
	pass?: string;
}

// remplacer tag et img par userId, permet de le retrouver dans le store usersList
interface IMessage {
	tag: string,
	img: string,
	msg: string,
	date: Date
}


	const sideNavDataLeft = ref({
		name: 'Channels',
		isOpen: false,
		items: [
			{
				name: 'New',
				children: null,
				href: '/chat/new'
			},
			{
				name: 'All channels',
				children: [	// need to get it
					{ name: 'chan1', href: '/chat/id1' },
					{ name: 'chan2', href: '/chat/id2' },
					{ name: 'chan3', href: '/chat/id3' },
					{ name: 'chan4', href: '/chat/id4' },
				],
				isOpen: false
			},
			{
				name: 'My channels',
				children: [
					{ name: 'chan1', href: '/chat/id1' },
					{ name: 'chan3', href: '/chat/id3' },
				],
				isOpen: true
			}
		]
	})

	const sideNavDataRight = ref({
		name: 'Friends',
		isOpen: false,
		items: [
			{
				name: 'All friends',
				children: [	// need to get it
					{ name: 'roger' },
					{ name: 'simon' },
					{ name: 'pierre' },
				],
				isOpen: false
			},
			{
				name: 'Currents users in channel',
				children: [	// need to get it
					{ name: 'homer' },
					{ name: 'roger' },
				],
				isOpen: true
			}
		]
	})

	let leftIsActive = ref(false);
	let rightIsActive = ref(false);

/// Messages
	let channelMsgs: [IMessage] = [
		{
			tag: "Roger",
			img: "src/assets/avatars/rogerRabbit.png",
			msg: "Bonjour",
			date: new Date()
		},
		{
			tag: "Homer",
			img: "src/assets/avatars/homer.jpeg",
			msg: "Bonjour",
			date: new Date()
		},
		{
			tag: "Homer",
			img: "src/assets/avatars/homer.jpeg",
			msg: "J'adore les pommes",
			date: new Date()
		},
	]

	let channelMsgs2: [IMessage] = [
		{
			tag: "Roger",
			img: "src/assets/avatars/rogerRabbit.png",
			msg: "Bonjour",
			date: new Date()
		},
		{
			tag: "Homer",
			img: "src/assets/avatars/homer.jpeg",
			msg: "Bonjour",
			date: new Date()
		},
		{
			tag: "Homer",
			img: "src/assets/avatars/homer.jpeg",
			msg: "J'adore les pommes",
			date: new Date()
		},
	]


	
let msg = ref("")

function submit(e: Event) {
	e.preventDefault()
	// fetch to server
	if (msg.value) {
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
	<div class="vue_wrapper chat">
		<button class="btn_side" @click="sideNavDataLeft.isOpen = !sideNavDataLeft.isOpen">{{ sideNavDataLeft.name }}</button>
		<button class="btn_side" @click="sideNavDataRight.isOpen = !sideNavDataRight.isOpen">{{ sideNavDataRight.name }}</button>
		<SideNav :class="{open: sideNavDataLeft.isOpen}" class="item" :model="sideNavDataLeft" :onRight="false"></SideNav>
		
		<!-- put it to a component ? -->
		<div class="room">
			<div class="chatRoom" id="room-view">
				<div v-for="msg in channelMsgs" :key="msg.tag" class="message">
					<figure>
						<img :src="msg.img" :alt="msg.tag + ' avatar'">
						<BtnChallenge></BtnChallenge>
					</figure>
					<p>
						<span class="tag">{{ msg.tag }}</span> | 
						<span class="time"> {{ msg.date.toLocaleDateString('fr-fr') }} {{ msg.date.getHours() }}:{{ msg.date.getMinutes() }}</span>
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
		
		<SideNav :class="{open: sideNavDataRight.isOpen}" class="item" :model="sideNavDataRight" :onRight="true"></SideNav>
	</div>
</template>

<style scoped>

.vue_wrapper.chat {
	display: flex;
	justify-content: space-between;
	flex-flow: column;
	padding: 0;
}

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
	min-height: 50px;
	max-height: 500px;
	min-width: 80vw;
	max-width: 80vw;
}

.room form input[type='submit'] {
	width: 20vw;
	height: 50px;
}


@media screen and (min-width: 768px) {
	.vue_wrapper.chat {
		/* min-height: 90vh; */
		align-items: center;
		flex-flow: row;
	}

	.room {
		flex-grow: 1;
	}

	.room form {
		width: 70%;
	}
	.room form textarea {
	min-height: 50px;
	max-height: 500px;
	min-width: 70%;
	max-width: 70%;
}

	.room form input[type='submit'] {
		width: 20%;
		height: 50px;
	}

	.btn_side {
		display: none;
	}
}

@media screen and (min-width: 1024px) {

}

</style>
