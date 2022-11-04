<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView } from "vue-router";


let winWidth = ref(window.innerWidth)
const props = defineProps({
	model: {type: [Object], required: true},
	onRight: {type: Boolean, required: true}
})

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

onBeforeMount(() => {
	window.addEventListener('resize', (e) => updateWinWidthValue(e));
	// check on start
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
			X
			<!-- {{ props.model.name }} -->
		</button>
		<li v-for="el, index in model.items" :key="el">
			<nav
				:class="{ bold: isFolder(index) }"
				@click="toggle(index)">
				<RouterLink v-if="el.href" :to="el.href">
					{{ el.name }}
				</RouterLink>
				<button v-else>{{ el.name }}
					<span v-if="isFolder(index)">[{{ isOpen(index) ? '-' : '+' }}]</span>
				</button>
			</nav>
			<nav>
				<ul v-show="isOpen(index)" v-if="isFolder(index)">
					<li v-for="child in el.children" :key="child">
						<RouterLink v-if="child.href" :to="child.href">
							{{ child.name }}
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