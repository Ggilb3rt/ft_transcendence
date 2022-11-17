<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useChannelsStore } from '@/stores/channels'
import { useUserStore } from '@/stores/user';
import CarbonClose from '@/components/icones-bags/CarbonClose.vue'
import ModalRestrictUser from './ModalRestrictUser.vue';
import ModalAddAdmin from './ModalAddAdmin.vue';
import ModalRemoveAdmin from './ModalRemoveAdmin.vue';
import ModalChangeChanType from './ModalChangeChanType.vue';
import ModalChangePass from './ModalChangePass.vue';
import ModalKickUser from './ModalKickUser.vue'

const channelsStore = useChannelsStore()
const userStore = useUserStore()
const adminPanel = ref(false)

</script>

<template>
	<div id="admin-panel-wrapper" v-if="channelsStore.currentChan?.isAdmin(userStore.user.id) || channelsStore.currentChan?.isOwner(userStore.user.id)" >
		<button id="admin-panel-btn" @click="adminPanel = true">
				Open admin panel
		</button>
		<div 
			class="admin-bar"
			v-if="channelsStore.currentChan.isAdmin(userStore.user.id) || channelsStore.currentChan.isOwner(userStore.user.id)"
			v-show="adminPanel"
		>
			<button @click="adminPanel = false"><i class="icon_btn"><CarbonClose></CarbonClose></i></button>
			<p>As admin</p>
			<ModalRestrictUser></ModalRestrictUser>
			<ModalAddAdmin></ModalAddAdmin>
			<ModalKickUser></ModalKickUser>
			<div class="owner-bar" v-if="channelsStore.currentChan.isOwner(userStore.user.id)">
				<p>As owner</p>
				<ModalRemoveAdmin></ModalRemoveAdmin>
				<ModalChangeChanType></ModalChangeChanType>
				<ModalChangePass v-if="channelsStore.currentChan?.getType() == 'pass'"></ModalChangePass>
			</div>
		</div>
	</div>
</template>


<style>
#admin-panel-wrapper {
	/* position: fixed; z-index: 9; */
	margin-bottom: 20px;
	padding: 5px;
}
#admin-panel-btn:hover {
	transform: scale(1.05);
	animation: whao 0.5s infinite alternate ease-out;
}
#admin-panel-btn {
	background: #fff;
	border: none;
	color: var(--vt-c-black-soft);
}
#admin-panel-btn:hover {
	color: var(--vt-c-white-mute);
}

.admin-bar button {
	background: var(--vt-c-white-mute);
	color: var(--vt-c-black-soft);
}

.admin-bar {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	background: var(--global-c-blue);
	padding: 10px;
	z-index: 9;
	color: var(--color-text);
}

.admin-bar button {
	width: 100%;
}

</style>