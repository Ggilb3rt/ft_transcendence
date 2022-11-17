<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onRenderTriggered, ref } from 'vue'
import { RouterLink } from "vue-router";
import router from '@/router';
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

onBeforeMount(() => {
	window.addEventListener('resize', (e) => updateWinWidthValue(e));
	if (winWidth.value >= 768)
		props.model.isOpen = true
	else
		props.model.isOpen = false
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
		<slot></slot>
	</ul>
</template>

<style>
.second_side_menu {
	height: calc(100vh - 89px);
	overflow-y: scroll;
	overflow-x: hidden;
	display: none;
	background: #000;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;
	padding: 20px 10px;
}

.channel_link {
	/* display: flex; */
	overflow: hidden;
	position: relative;
}
.channel_link:hover .btn_hide {
	right: 0;
}
.channel_link.router-link-active.router-link-exact-active::before {
	content: '';
	display: block;
	width: 10px;
	height: 10px;
	border-radius: 10px;
	background: white;
	position: absolute;
	top: calc(50% - 5px);
	right: -5px;
}

.btn_hide {
	position: absolute;
	border: none;
	color: var(--vt-c-white-mute);
	width: 25px;
	height: 25px;
	right: -25px;
	top: calc(50% - 12px);
	transition: all .3s ease-in-out;
}
.btn_join {
	background: var(--global-c-blue);
}
.btn_leave {
	background: var(--global-c-red);
}
.btn_leave:hover {
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

ul li button.folder {
	border: none;
	background: none;
	color: gray;
	font-size: 15px;
}

ul li nav {
	padding-left: 5px;
	margin-left: 15px;
	margin-bottom: 15px;
	border-left: 1px solid rgba(255,255,255,.2);
}

ul li ul {
	padding: 0;
	margin: 0;
}

ul li ul li a, .like-link {
	padding: 5px;
	display: block;
}

/* ul li ul li:nth-child(even) a{
	background: var(--color-background-soft);
} */

/* ul li ul li:nth-child(n+2) a{
	border-top: 1px solid #fff;
} */

@media screen and (min-width: 768px) {
	.second_side_menu {
		position: relative;
		width: 20vw;
	}
}

@media screen and (min-width: 1024px) {
	.side_right, .side_left {
		width: calc(1 / 6 * 100%);
	}
}

</style>