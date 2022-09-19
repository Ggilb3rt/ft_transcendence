<script setup lang="ts">
	import { ref } from 'vue'
	import SideNav from '../components/navigation/SideNav.vue';

	const sideNavDataLeft = ref({
		name: 'Channels',
		isOpen: false,
		items: [
			{name: 'New', children: null},
			{
				name: 'All channels',
				children: [	// need to get it
					{ name: 'chan1' },
					{ name: 'chan2' },
					{ name: 'chan3' },
					{ name: 'chan4' },
				],
				isOpen: false
			},
			{
				name: 'My channels',
				children: [
					{ name: 'chan1' },
					{ name: 'chan3' },
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
	
	let msg = ref("")

	function submit(e: Event) {
		e.preventDefault()
		if (msg.value) {
			console.log(msg.value)
			channelMsgs.push({
				tag: "Homer",
				img: "src/assets/avatars/homer.jpeg",
				msg: msg.value,
				date: new Date()
			})
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
			<p v-for="msg in channelMsgs" :key="msg.tag" class="message">
				<img :src="msg.img" :alt="msg.tag + ' avatar'">
				<span class="tag">{{ msg.tag }} </span>
				<span class="time"> {{ msg.date.toLocaleDateString() }}</span>
				<br>
				{{ msg.msg }}
			</p>
			<form @keyup.enter="submit">
				<input type="text" v-model="msg">
				<input type="submit" class="send" @click="submit">
			</form>
		</div>
		
		<SideNav :class="{open: sideNavDataRight.isOpen}" class="item" :model="sideNavDataRight" :onRight="true"></SideNav>
	</div>
</template>

<style scoped>

.vue_wrapper.chat {
	display: flex;
	justify-content: space-between;
	flex-flow: column;
}

.room .message img{
	width: 50px;
	height: 50px;
	border-radius: 50px;
}

@media (min-width: 768px) {
	.vue_wrapper.chat {
		min-height: 90vh;
		align-items: center;
		flex-flow: row;
	}

	.btn_side {
		display: none;
	}
}

@media (min-width: 1024px) {

}

</style>
