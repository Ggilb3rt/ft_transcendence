<script setup lang="ts">
import { ref, onUpdated, watch, onBeforeMount, onBeforeUpdate, onRenderTriggered } from 'vue'
import { useRoute } from 'vue-router';
import router from "@/router"
import type {TMessage, TChannelType, TRestrictUserTime, IChannel, IChannelRestrict} from '../../typesChat'
import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';
import { useChannelsStore } from '@/stores/channels'
import SideNav from '../components/navigation/SideNav.vue';
import BtnChallenge from '@/components/navigation/BtnChallenge.vue'
import CreateChanForm from '@/components/chat/CreateChanForm.vue'
import ModalNeedPass from '@/components/chat/ModalNeedPass.vue';
import Loader from '@/components/navigation/loader.vue'
import chatSideNav from '@/components/navigation/chatSideNav.vue';
import chatSideNavLeft from '@/components/navigation/chatSideNavLeft.vue';

const usersStore = useUsersStore()
const userStore = useUserStore()
const channelsStore = useChannelsStore()
const route = useRoute()

const sideNavDataLeft = ref({
	name: 'Channels',
	isOpen: false,
})

const sideNavDataRight = ref({
	name: 'Friends',
	isOpen: false,
})


onBeforeMount(() => {
	channelsStore.unselectCurrentChan()
})

// onRenderTriggered((e) => {
// 	debugger
// })

</script>

<template>
	<div class="vue_wrapper chat">
		<button class="btn_side" @click="sideNavDataLeft.isOpen = !sideNavDataLeft.isOpen">{{ sideNavDataLeft.name }}</button>
		<button class="btn_side" @click="sideNavDataRight.isOpen = !sideNavDataRight.isOpen">{{ sideNavDataRight.name }}</button>
		<!-- <SideNav :class="{open: sideNavDataLeft.isOpen}" class="item" :model="sideNavDataLeft" :onRight="false"></SideNav> -->
		<!-- <chatSideNavLeft class="item open" :onRight="false"></chatSideNavLeft> -->
		<SideNav :class="{open: sideNavDataLeft.isOpen}" class="item" :model="sideNavDataLeft" :onRight="false">
			<chatSideNavLeft class="item open" :onRight="false"></chatSideNavLeft>
		</SideNav>


		<Loader v-if="route.name == 'chat' && userStore.loading"></Loader>
		<CreateChanForm v-else-if="route.name == 'chat'"></CreateChanForm>
		<router-view v-else></router-view>
		<!-- <chatSideNav class="item open" :onRight="true"></chatSideNav> -->

		<SideNav :class="{open: sideNavDataRight.isOpen}" class="item" :model="sideNavDataRight" :onRight="true">
			<chatSideNav class="item open" :onRight="true"></chatSideNav>
		</SideNav>
		<!-- <ModalNeedPass v-if="channelsStore.error.includes('pass')"></ModalNeedPass> -->
		<ModalNeedPass></ModalNeedPass>
		
	</div>
</template>

<style scoped>

.vue_wrapper.chat {
	display: flex;
	justify-content: space-between;
	flex-flow: column;
	padding: 0;
}

@media screen and (min-width: 768px) {
	.vue_wrapper.chat {
		/* min-height: 90vh; */
		align-items: flex-start;
		flex-flow: row;
	}

	.btn_side {
		display: none;
	}
}

@media screen and (min-width: 1024px) {

}

</style>
