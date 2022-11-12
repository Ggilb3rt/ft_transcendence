<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onRenderTriggered, ref } from 'vue'
import type { sideNav, sideNavItem, sideNavLink } from "../../../types"
import { RouterLink } from "vue-router";
import router from '@/router';
import { useChannelsStore } from '@/stores/channels';
import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';
import CarbonClose from "@/components/icones-bags/CarbonClose.vue"


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

function leaveChannel(link: string) {
	const id: number = getChanIdFromLink(link)
	
	if(id && confirm(`You want to leave chan ${id} ?`)) {
		// emit to server
		// if (channelsStore.currentChan)
		channelsStore.emitQuitChannel(id)
		console.log("you leave chan", id)
	}
}

function joinChannel(e: Event, link: string) {
	e.preventDefault()
	const id: number = getChanIdFromLink(link)
	// emit sur join et attendre la réponse
	if (confirm(`join channel '${id}' from '${link}' ?`)) {
		channelsStore.emitJoin(id)
	}
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




const sideNavDataLeft = ref({
	name: 'Channels',
	isOpen: false,
	items: [
		// {
		// 	name: 'New',
		// 	children: null,
		// 	id '/chat/new'
		// },
		{
			name: 'All channels3',
			// children: channelList.value,	// need to getAllChannelRestrict [IChannelRestrict]
			children: channelsStore.getChanListForSideBar(false),
			canJoin: true,
			isOpen: false
		},
		{
			name: 'My channels',
			children: channelsStore.getChanListForSideBar(true),
			isOpen: true
		}
	]
})


</script>

<template>
	<ul :class="{side_right: onRight, side_left: !onRight}" class="second_side_menu">
		<button 
			v-if="winWidth < 768"
			class="btn_side"
			@click="toggle(0)"
		>
			<i class="icon_btn">
				<CarbonClose></CarbonClose>
			</i>
		</button>

		<li>
			<button @click="toggle(0)">Availables [{{ isOpen(0) ? '-' : '+' }}]</button>
			<nav class="bold" >
				<ul v-show="isOpen(0)">
					<li v-for="child in channelsStore.getChanListForSideBar(false)" :key="child.id">
						<a href="#" rel="nofollow" v-if="child.id" class="channel_link" @click="joinChannel($event, child.id)">{{ child.name }}</a>
					</li>
				</ul>
			</nav>

			<button @click="toggle(1)">Joined [{{ isOpen(1) ? '-' : '+' }}]</button>
			<nav class="bold">
				<ul v-show="isOpen(1)">
					<li v-for="child in channelsStore.getChanListForSideBar(true)" :key="child.id">
						<RouterLink v-if="child.id" :to="child.id" class="channel_link">
							{{ child.name }}
							<button v-if="!onRight" @click.prevent="leaveChannel(child.id)" class="btn_hide btn_leave"><CarbonClose></CarbonClose></button>
						</RouterLink>
					</li>
				</ul>
			</nav>
		</li>
		<!-- <li v-for="el, index in currentSideNav.items" :key="el.name">
			<nav
				:class="{ bold: isFolder(index) }"
				@click="toggle(index)"
			>
				<RouterLink v-if="el.id" :to="el.id">
					{{ el.name }}
				</RouterLink>
				<button>{{ el.name }}
					<span v-if="isFolder(index)">[{{ isOpen(index) ? '-' : '+' }}]</span>
				</button>
			</nav>
			<nav>
				<ul v-show="isOpen(index)" v-if="isFolder(index)">
					<li v-for="child in el.children" :key="child.id">
						<a href="#" rel="nofollow" v-if="child.id && el.canJoin" class="channel_link" @click="joinChannel($event, child.id)">{{ child.name }}</a>
						<RouterLink v-else-if="child.id" :to="child.id" class="channel_link">
							{{ child.name }}
							<button v-if="!onRight && !el.canJoin" @click.prevent="leaveChannel(child.id)" class="btn_hide btn_leave"><CarbonClose></CarbonClose></button>
						</RouterLink>
						<button v-else>{{ child.name }}</button>
					</li>
				</ul>
			</nav>
		</li> -->
	</ul>
</template>

<style scoped>
.second_side_menu {
	min-height: 100vh;
	display: none;
	background: #000;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;
	padding: 20px;
}

.channel_link {
	/* display: flex; */
	overflow: hidden;
	position: relative;
}
.channel_link:hover .btn_hide {
	right: 0;
}

.btn_hide {
	position: absolute;
	border: none;
	color: var(--vt-c-white-mute);
	width: 25px;
	height: 25px;
	right: -25px;
	transition: right .3s ease-in-out;
}
.btn_join {
	background: var(--global-c-blue);
}
.btn_leave {
	background: var(--global-c-red);
}

.btn_side {
	font-size: 1.5rem;
	display: inline-flex;
}

.side_left.open {
	display: block;
}

.side_right.open {
	display: block;
}

ul a, .like-link {
	word-break: break-all;
}

ul li ul {
	padding: 0;
	margin: 10px 0;
}

ul li ul li a, .like-link {
	padding: 5px;
	display: block;
}

/* ul li ul li:nth-child(even) a{
	background: var(--color-background-soft);
} */

ul li ul li:nth-child(n+2) a{
	border-top: 1px solid #fff;
}

@media screen and (min-width: 768px) {
	.second_side_menu {
		position: relative;
		max-width: 15vw;
	}
}

@media screen and (min-width: 1024px) {
	.side_right, .side_left {
		width: calc(1 / 6 * 100%);
	}
}


</style>