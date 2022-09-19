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

</script>

<template>
	<div class="vue_wrapper chat">
		<button class="btn_side" @click="sideNavDataLeft.isOpen = !sideNavDataLeft.isOpen">{{ sideNavDataLeft.name }}</button>
		<button class="btn_side" @click="sideNavDataRight.isOpen = !sideNavDataRight.isOpen">{{ sideNavDataRight.name }}</button>
		<SideNav :class="{open: sideNavDataLeft.isOpen}" class="item" :model="sideNavDataLeft" :onRight="false"></SideNav>
		<div class="room">Bonjour</div>
		<SideNav :class="{open: sideNavDataRight.isOpen}" class="item" :model="sideNavDataRight" :onRight="true"></SideNav>
	</div>
</template>

<style scoped>

.vue_wrapper.chat {
	display: flex;
	justify-content: space-between;
	flex-flow: column;
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
