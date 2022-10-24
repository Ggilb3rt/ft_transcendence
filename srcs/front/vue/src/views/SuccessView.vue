<script setup lang="ts">
import { useUserStore } from "@/stores/user"
import { onBeforeMount, onBeforeUnmount, onMounted } from "@vue/runtime-core";
import Loader from '../components/navigation/loader.vue';

const userStore = useUserStore()

onBeforeMount(() => {
	userStore.loading = true
})

onMounted(() => {
	// setup the stores
	// redirect to "/"
})

onBeforeUnmount(() => {
	userStore.loading = false
})

</script>

<template>
	<div>
		empty
		<Loader></Loader>
	</div>
</template>