<script setup lang="ts">
	import { ref } from 'vue'
	import SideNav from '../components/navigation/SideNav.vue';

	const sideNavDataLeft = ref({
		name: 'Channels',
		isOpen: false,
		items: [
			{name: 'New', children: null, href: '/chat/new'},
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
				name: 'Current channel',
				children: [	// need to get it
					{ name: 'homer' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
					{ name: 'simon' },
				],
				isOpen: true
			}
		]
	})

	let leftIsActive = ref(false);
	let rightIsActive = ref(false);

	interface IMessage {
		tag: string,
		img: string,
		msg: string,
		date: Date
	}

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

	// function scrollToBottom(op) {
	// 	const el = this.$el.getElementsByClassName('room')[0];
		
	// 	console.log(op)
	// 	if (el) {
	// 		el.scrollIntoView(op);
	// 	}
	// }

	function submit(e: Event) {
		e.preventDefault()
		if (msg.value) {
			// const toSend = new Promise ((resolve, error) => 
			// {
				channelMsgs.push({
					tag: "Homer",
					img: "src/assets/avatars/homer.jpeg",
					msg: msg.value,
					date: new Date()
				})
				// scrollToBottom(document.getElementById('room-view').lastChild)
				// resolve(true)
			// })
			// .then((val) => {
				// console.log(val)
				const room = document.getElementById('room-view')
				if (room) {
					// const lastEl = room.getElementsByTagName('p');
					console.log(room.childNodes.length)
					console.log(room.childNodes)
					// console.log(lastEl)
					room.scrollTo({
						top: room.scrollHeight,
						left: 0,
						behavior: 'smooth'
					});
					// lastEl[lastEl.length - 1].scrollIntoView({behavior: 'smooth'})
				}
			// })
		}
		msg.value = ""
	}

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
