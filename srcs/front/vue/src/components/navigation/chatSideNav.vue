<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onRenderTriggered, ref } from 'vue'
import type { sideNav, sideNavItem, sideNavLink } from "../../../types"
import { RouterLink } from "vue-router";
import router from '@/router';
import { useChannelsStore } from '@/stores/channels';
import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';
import CarbonClose from "@/components/icones-bags/CarbonClose.vue"
import MdiCrown from "@/components/icones-bags/MdiCrown.vue"
import MdiCrownOutline from "@/components/icones-bags/MdiCrownOutline.vue"


const props = defineProps({
	onRight: {type: Boolean, required: true}
})
let winWidth = ref(window.innerWidth)
const channelsStore = useChannelsStore()
const usersStore = useUsersStore()
const userStore = useUserStore()
const folders = ref([{isOpen: true}, {isOpen: true}])


function isOpen(index: number) {
	return folders.value[index].isOpen
}
// function isFolder(index: number) {
// 	return props.model.items[index].children && props.model.items[index].children.length
// }
function toggle(index: number) {
	folders.value[index].isOpen = !folders.value[index].isOpen
}

function updateWinWidthValue() {
	winWidth.value = window.innerWidth
		if (winWidth.value >= 768)
			folders.value.forEach(el => {
				el.isOpen = true
			});
		else
			folders.value.forEach(el => {
				el.isOpen = false
			});
}

function getChanIdFromLink(link: string): number {
	return parseInt(link.split('/').at(-1))
}

onBeforeMount(() => {
	window.addEventListener('resize', (e) => updateWinWidthValue());
	// check on start
	// updateWinWidthValue()

})

onBeforeUnmount(() => {
	window.removeEventListener('resize', (e) => updateWinWidthValue())
})

// onRenderTriggered((e) => {
// 	debugger
// })

function isOwner(el: sideNavLink): boolean {
	const userId: number = getChanIdFromLink(el.id)
	if (channelsStore.currentChan)
		if (channelsStore.currentChan.isOwner(userId))
			return true
	return false
}

function isAdmin(el: sideNavLink): boolean {
	const userId: number = getChanIdFromLink(el.id)
	if (channelsStore.currentChan)
		if (channelsStore.currentChan.isAdmin(userId))
			return true
	return false
}

</script>

<template>
		<li>
			<button @click="toggle(0)" class="folder">Friends [{{ isOpen(0) ? '-' : '+' }}]</button>
			<nav class="bold">
				<ul v-show="isOpen(0)">
					<li v-for="el in usersStore.getUsersListForChat(userStore.getFriendsList())" :key="el.id">
						<RouterLink v-if="el.id" :to="el.id" class="channel_link" :title="el.name">
							{{ el.name }}
						</RouterLink>
					</li>
				</ul>
			</nav>
			<button @click="toggle(1)" class="folder">Current user [{{ isOpen(1) ? '-' : '+' }}]</button>
			<nav class="bold">
				<ul v-show="isOpen(1)">
					<li v-for="el in usersStore.getUsersListForChat(channelsStore.getUsersInChannel())" :key="el.id">
						{{ el.name }}
						<i v-if="isOwner(el)"><MdiCrown></MdiCrown></i>
						<i v-else-if="isAdmin(el)"><MdiCrownOutline></MdiCrownOutline></i>
					</li>
				</ul>
			</nav>
		</li>
</template>

<style scoped>

</style>