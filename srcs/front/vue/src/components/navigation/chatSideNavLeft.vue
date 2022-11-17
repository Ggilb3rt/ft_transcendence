<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onRenderTriggered, ref } from 'vue'
import type { sideNav, sideNavItem, sideNavLink } from "../../../types"
import { RouterLink } from "vue-router";
import router from '@/router';
import { useChannelsStore } from '@/stores/channels';
import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';
import CarbonClose from "@/components/icones-bags/CarbonClose.vue"
import AdminPanel from '../chat/AdminPanel.vue';


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

function leaveChannel(link: string) {
	const id: number = getChanIdFromLink(link)
	
	if(id)
		channelsStore.emitQuitChannel(id)
}

function joinChannel(e: Event, link: string) {
	e.preventDefault()
	const id: number = getChanIdFromLink(link)
	channelsStore.emitJoin(id)
}

onBeforeMount(() => {
	window.addEventListener('resize', (e) => updateWinWidthValue());
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', (e) => updateWinWidthValue())
})

</script>

<template>
		<li>
			<AdminPanel></AdminPanel>

			<button @click="toggle(0)" class="folder">Availables [{{ isOpen(0) ? '-' : '+' }}]</button>
			<nav class="bold" >
				<ul v-show="isOpen(0)">
					<li v-for="child in channelsStore.getChanListForSideBar(false)" :key="child.id">
						<a href="#" :title="child.id" rel="nofollow" v-if="child.id" class="channel_link" @click="joinChannel($event, child.id)">{{ child.name }}</a>
					</li>
				</ul>
			</nav>

			<button @click="toggle(1)" class="folder">Joined [{{ isOpen(1) ? '-' : '+' }}]</button>
			<nav class="bold">
				<ul v-show="isOpen(1)">
					<li v-for="child in channelsStore.getChanListForSideBar(true)" :key="child.id">
						<RouterLink v-if="child.id" :to="child.id" class="channel_link" :title="child.name">
							<!-- {{ child.name.length < 10 ? child.name : `${child.name.substring(0, 7)}...` }} -->
							{{ child.name }}
							<button v-if="!onRight" @click.prevent="leaveChannel(child.id)" class="btn_hide btn_leave"><CarbonClose></CarbonClose></button>
						</RouterLink>
					</li>
				</ul>
			</nav>
		</li>
</template>

<style scoped>

button {
	margin: 0;
	padding: 0;
}


</style>