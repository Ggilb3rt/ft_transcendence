<script setup lang="ts">
	import { ref } from 'vue'

	const props = defineProps({
		model: {type: [Object], required: true},
		onRight: {type: Boolean, required: true}
	})

	const isOpen = (index: number) => {
		return props.model.items[index].isOpen
	}
	const isFolder = (index: number) => {
		return props.model.items[index].children && props.model.items[index].children.length
	}

	function toggle(index: number) {
		props.model.items[index].isOpen = !props.model.items[index].isOpen
	}

	let winWidth = ref(window.innerWidth)

	window.addEventListener('resize', (e) => {
		winWidth.value = window.innerWidth
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
			{{ props.model.name }}
		</button>
		<li v-for="el, index in model.items" :key="el">
			<div
				:class="{ bold: isFolder(index) }"
				@click="toggle(index)">
				{{ el.name }}
				<span v-if="isFolder(index)">[{{ isOpen(index) ? '-' : '+' }}]</span>
			</div>
			<ul v-show="isOpen(index)" v-if="isFolder(index)">
				<li v-for="child in el.children" :key="child">
					{{ child.name }}
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
}

.side_left.open {
	display: block;
}

.side_right.open {
	display: block;
}

@media (min-width: 768px) {
	.second_side_menu {
		position: relative;
	}
}

@media (min-width: 1024px) {
	.side_right, .side_left {
		width: calc(1 / 6 * 100%);
	}
}


</style>