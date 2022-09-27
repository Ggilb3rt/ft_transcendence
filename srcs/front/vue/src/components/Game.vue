<script setup lang="ts">
	import { reactive } from 'vue'

	defineProps<{
		msg: string;
	}>();

	const state = reactive({
		p1Pos: 0,
		p2Pos: 0})

	const styleCanvas = {
		width: '500px',
		height: '200px'
	}

	window.addEventListener('keydown', function(e) {
		if (e.key == 'ArrowUp' || e.key == 'z') {
			if (state.p1Pos > 0)
				state.p1Pos--
		}
		else if (e.key == 'ArrowDown' || e.key == 's') {
			if (state.p1Pos < 50 )
				state.p1Pos++
		}


	});
</script>

<template>
	<div class="gameWindow">
		<p class="blue">{{ msg }}</p>
		<p>Player 1 position : {{ state.p1Pos }}</p>
		<p>Player 2 position : {{ state.p2Pos }}</p>
		<canvas class="lol" :style="styleCanvas">lol</canvas>
	</div>
</template>
	
<style scoped>
	h1 {
	  font-weight: 500;
	  font-size: 2.6rem;
	  top: -10px;
	}
	
	h3 {
	  font-size: 1.2rem;
	}

	canvas {
		background: red
	}
	
	.lol {
		width: 100px;
		height: 100px;
	}

	@media screen and (min-width: 1024px) {

	}
</style>
