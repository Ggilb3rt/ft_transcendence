<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useChannelsStore } from '@/stores/channels'
import { useUserStore } from '@/stores/user';
import CarbonClose from '@/components/icones-bags/CarbonClose.vue'


const channelsStore = useChannelsStore()
const userStore = useUserStore()
const adminPanel = ref(false)




</script>

<template>
	<div v-if="channelsStore.currentChan?.isAdmin(userStore.user.id)" >
		<button @click="adminPanel = true">
			Open admin panel
		</button>
		<div class="admin-bar" v-if="channelsStore.currentChan.isAdmin(userStore.user.id)" v-show="adminPanel">
			<button @click="adminPanel = false"><i class="icon_btn"><CarbonClose></CarbonClose></i></button>
			<button>Restrict user</button>
			<button>Add admin</button>
			<button>Kick user</button>
			<div class="owner-bar" v-if="channelsStore.currentChan.isOwner(userStore.user.id)">
				<button>Remove admin</button>
				<button>Change channel Type</button>
				<button v-if="channelsStore.currentChan?.getType() == 'pass'">Change password</button>
			</div>
		</div>
	</div>
</template>


<style>

.room .admin-bar {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	background: var(--global-c-blue);
	padding: 10px;
	z-index: 9;
}

</style>