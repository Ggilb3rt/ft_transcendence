<script setup lang="ts">
	import { ref } from 'vue'
	
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

	window.addEventListener('resize', (e) => {
		winWidth.value = window.innerWidth
		if (winWidth.value >= 768)
			props.model.isOpen = true
		else
			props.model.isOpen = false
	});
	if (winWidth.value >= 768)
		props.model.isOpen = true
	else
		props.model.isOpen = false
</script>

<template>
	<ul :class="{side_right: onRight, side_left: !onRight}" class="second_side_menu">
		<button 
			class="btn_side"
			@click="props.model.isOpen = !props.model.isOpen"
			v-if="winWidth < 768">
			X
			<!-- {{ props.model.name }} -->
		</button>
		<li v-for="el, index in model.items" :key="el">
			<div
				:class="{ bold: isFolder(index) }"
				@click="toggle(index)">
				<a v-if="el.href" :href="el.href">
					{{ el.name }}
				</a>
				<button v-else>{{ el.name }}
					<span v-if="isFolder(index)">[{{ isOpen(index) ? '-' : '+' }}]</span>
				</button>
			</div>
			<ul v-show="isOpen(index)" v-if="isFolder(index)">
				<li v-for="child in el.children" :key="child">
					<a v-if="child.href" :href="child.href">
						{{ child.name }}
					</a>
					<button v-else>{{ child.name }}</button>
				</li>
			</ul>
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

@media screen and (min-width: 768px) {
	.second_side_menu {
		position: relative;
	}
}

@media screen and (min-width: 1024px) {
	.side_right, .side_left {
		width: calc(1 / 6 * 100%);
	}
}


</style>