<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from "vue-router";
import { useChannelsStore } from '@/stores/channels';
import { useUsersStore } from '@/stores/users';
import CarbonClose from "@/components/icones-bags/CarbonClose.vue"


const props = defineProps({
	model: {type: [Object], required: true},
	onRight: {type: Boolean, required: true}
})

let winWidth = ref(window.innerWidth)
const channelsStore = useChannelsStore()
const usersStore = useUsersStore()

function isOpen(index: number) {
	return props.model.items[index].isOpen
}
function isFolder(index: number) {
	return props.model.items[index].children && props.model.items[index].children.length
}
function toggle(index: number) {
	props.model.items[index].isOpen = !props.model.items[index].isOpen
}

function updateWinWidthValue(e: Event) {
	winWidth.value = window.innerWidth
		if (winWidth.value >= 768)
			props.model.isOpen = true
		else
			props.model.isOpen = false
}

function leaveChannel(link: string) {
	const id: Array<string> = link.split('/').at(-1)
	
	if(id && confirm(`You want to leave chan ${id} ?`)) {
		// send to server
		console.log("you leave chan", id)
	}
}

function joinChannel(link: string) {
	alert(`you join channel ${link}`)
}

onBeforeMount(() => {
	window.addEventListener('resize', (e) => updateWinWidthValue(e));
	// check on start
	if (winWidth.value >= 768)
		props.model.isOpen = true
	else
		props.model.isOpen = false

	if (props.onRight) {
		if (channelsStore.currentChan) {
			if (props.model.items.length > 1) {
				props.model.items[1].children = usersStore.getUsersListForChat(channelsStore.getUsersInChannel())
			}
		}
		else{
			if (props.model.items.length > 1) {
				props.model.items[1].children = []
			}
		}
	}
	// console.log("la side nav ", props.model.items)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', (e) => updateWinWidthValue(e))
})

</script>

<template>
	<ul :class="{side_right: onRight, side_left: !onRight}" class="second_side_menu">
		<button 
			v-if="winWidth < 768"
			class="btn_side"
			@click="props.model.isOpen = !props.model.isOpen"
		>
			<i class="icon_btn">
				<CarbonClose></CarbonClose>
			</i>
		</button>
		<li v-for="el, index in model.items.value" :key="el">
			<nav
				:class="{ bold: isFolder(index) }"
				@click="toggle(index)">
				<RouterLink v-if="el.id" :to="el.id">
					{{ el.name }}
				</RouterLink>
				<button v-else>{{ el.name }}
					<span v-if="isFolder(index)">[{{ isOpen(index) ? '-' : '+' }}]</span>
				</button>
			</nav>
			<nav>
				<ul v-show="isOpen(index)" v-if="isFolder(index)">
					<li v-for="child in el.children" :key="child">
						<RouterLink v-if="child.id" :to="child.id" class="channel_link">
							{{ child.name }}
							<button v-if="!onRight && el.canJoin" @click.prevent="joinChannel(child.id)" class="btn_hide btn_join">join</button>
							<button v-if="!onRight && !el.canJoin" @click.prevent="leaveChannel(child.id)" class="btn_hide btn_leave"><CarbonClose></CarbonClose></button>
						</RouterLink>
						<button v-else>{{ child.name }}</button>
					</li>
				</ul>
			</nav>
		</li>
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

ul a {
	word-break: break-all;
}

ul li ul {
	padding: 0;
	margin: 10px 0;
}

ul li ul li a {
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