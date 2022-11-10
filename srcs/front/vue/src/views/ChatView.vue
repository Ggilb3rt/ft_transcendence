<script setup lang="ts">
import { ref, onUpdated, watch, onBeforeMount, onBeforeUpdate } from 'vue'
import { useRoute } from 'vue-router';
import router from "@/router"
import type {TMessage, TChannelType, TRestrictUserTime, IChannel, IChannelRestrict} from '../../typesChat'
import { useUsersStore } from '@/stores/users';
import { useUserStore } from '@/stores/user';
import { useChannelsStore } from '@/stores/channels'
import SideNav from '../components/navigation/SideNav.vue';
import BtnChallenge from '@/components/navigation/BtnChallenge.vue'
import CreateChanForm from '@/components/chat/CreateChanForm.vue'
import Loader from '@/components/navigation/loader.vue'

const usersStore = useUsersStore()
const userStore = useUserStore()
const channelsStore = useChannelsStore()
const route = useRoute()
// let leftIsActive = ref(false);
// let rightIsActive = ref(false);

/*
 * Routes for the back

	// channels types : cf TChannel below; if channel.type == "direct" nobody is owner nor admin, if you want to ban direct channel just ban the user

	// Global
		getAllChannels(userId:number, ??myBans:number[]??): IChannel[] {} (myBans est util uniquement pour ne pas avoir les direct msg, pas forcement util ici)
		getAllChannelsRestricts(userId:number): IChannelRestrict[] {}
		??getAllDirectMessages(userId:number, myBans:number[]): IChannel[] {} (pas sûr que cette function soit utile)
		??getMyChannels(userId:number): IChannel[] {}

		createChannel(userId(number), channelName:string, channelType:TChannel, pass?:string) : boolean {
			// owner is userId
		}
		getChannel(channelId:number): IChannel | null {}

	// Dans un channel
		getMessages(userId:number, channelId:number) : IMessage[] {
			// isInChannel(userId) && !isBan(userId)
			// return (getMessages of channel from prisma)
		}
		getUsersInChannel(userId:number, channelId:number): number[] {
			// if (channelId)
				// return channelId.userList
		}

		isInChannel(userId:number): boolean { this.userList.find(el => el == userId) ? true : false }
		isOwner(userId:number): boolean { userId == this.owner ? true : false }
		isAdmin(userId:number): boolean { this.adminList.find(el => el == userId) ? true : false }
		isMute(userId:number): boolean { this.muteList.find(el => el.userId == userId) ? true : false }
		endOfMute(userId:number): Date | null {
			const mutedUser: TRestrictUserTime = this.muteList.find(el => el.userId == userId)

			if (mutedUser)
				return mutedUser.expire
			return null
		} (soit ça soit isMute() return directement la Date ?)
		isBan(userId:number): Date { this.banList.find(el => el.userId == userId) ? true : false} (même chose que endOfMute mais en version Ban)

	// Devra probablement se passer via sockets (?)
	//! si methode d'un object Channel pas de channelId,chan mais un this
		joinChannel(userId:number, channelId:number): IMessage[] | null {
			const chan = getChannel(channelId)
			if (chan)) {
				if (!chan.isInChannel(userId) && !chan.isBan(userId)) {
					chan.userList.push(userId)
					// const [messages]: IMessage = prisma.getMessages(chan.id)
					// return messages
				}
			}
			return null
		}
		leaveChannel(userId:number, channelId:number): boolean {
			// check channelId exist
				// check user is in chan.userList
					// remove userId from chan.userList
					// return true
			// return false
		}
		renameChannel(userId:number, channelId:number, newName:string): boolean {
			// if channelId exist
				// if isOwner(userId)
					// if newName != chan.name
						// chan.name = newName
						// return true
			return false
		}
		changeChannelType(userId:number, channelId:number, newType:TChannel, pass?:string): boolean {
			// if channelId exist
				// if isOwner(userId)
					// if newType != chan.type
						// if newType === "pass" && pass.length > 5
							// chan.type = newType
							// chan.pass = pass
							// return true
						// else if newType === "direct"
							// return false
						// else
							// chan.type = newType
							// return true
			return false
		}
		changePass(userId:number, channelId:number, newPass:string): boolean {
			// if channelId exist
				// if isOwner(userId)
					// if chan.type == "pass"
						// if chan.pass != newPass && chan.pass > 5
							// chan.pass = newPass
							// return true
			// return false
		}
		addAdmin(nominator:number, nominated:number, channelId:number): boolean {
			// if channelId exist
				// if chan.isAdmin(nominator) && !chan.isAdmin(nominated)
					// chan.adminList.push(nominated)
					// return true
			return false
		}
		removeAdmin(remover:number, removed:number, channelId:number): boolean {
			// if channelId exist
				// if chan.isOwner(remover) && chan.isAdmin(removed) && remover != removed && removed != chan.owner
					// const find = chan.adminList.findIndex(el => el == removed)
					// chan.adminList.splice(find, 1)
					// return true
			return false
		}
		restrictUser(restrictor:number, restricted:number, channelId:number, onlyMute: boolean): boolean {
			// if channelId exist
				// if chan.isAdmin(restrictor)
		}

*/

// ChatView need to
	// getAllRestrictChannel
	// createChannel

// const channelList = ref([
// 	{ name: 'chan1', id: '/chat/room/1' },
// 	{ name: 'unNomDeChanBienTropLongSansEspacesEnPlusCommeCaJeFouBienLaMerde', id: '/chat/room/2' },
// 	{ name: 'chan3', id: '/chat/room/3' },
// 	{ name: 'chan4', id: '/chat/room/direct/4' },
// ])

const sideNavDataLeft = ref({
	name: 'Channels',
	isOpen: false,
	items: [
		// {
		// 	name: 'New',
		// 	children: null,
		// 	id '/chat/new'
		// },
		{
			name: 'All channels3',
			// children: channelList.value,	// need to getAllChannelRestrict [IChannelRestrict]
			children: channelsStore.getChanListForSideBar(false),
			canJoin: true,
			isOpen: false
		},
		{
			name: 'My channels',
			children: channelsStore.getChanListForSideBar(true),
			isOpen: true
		}
	]
})

const sideNavDataRight = ref({
	name: 'Friends',
	isOpen: false,
	items: [
		{
			name: 'All friends',
			children: usersStore.getUsersListForChat(userStore.getFriendsList()),
			isOpen: false
		},
		{
			name: 'Currents users in channel',
			// children: currentUserList.value,
			// children: childMounted.value,	// marche pas parceque je devrai props au sideNav qu'il doit se mettre à jour
			children: usersStore.getUsersListForChat(channelsStore.getUsersInChannel()), // bug, la mise à jour se fait en décalé
			isOpen: true
		}
	]
})

onBeforeMount(() => {
	channelsStore.unselectCurrentChan()
})


</script>

<template>
	<div class="vue_wrapper chat">
		<button class="btn_side" @click="sideNavDataLeft.isOpen = !sideNavDataLeft.isOpen">{{ sideNavDataLeft.name }}</button>
		<button class="btn_side" @click="sideNavDataRight.isOpen = !sideNavDataRight.isOpen">{{ sideNavDataRight.name }}</button>
		<SideNav :class="{open: sideNavDataLeft.isOpen}" class="item" :model="sideNavDataLeft" :onRight="false"></SideNav>

		<Loader v-if="route.name == 'chat' && userStore.loading"></Loader>
		<CreateChanForm v-else-if="route.name == 'chat'"></CreateChanForm>
		<router-view v-else></router-view>
		<SideNav :class="{open: sideNavDataRight.isOpen}" class="item" :model="sideNavDataRight" :onRight="true"></SideNav>
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
		align-items: center;
		flex-flow: row;
	}

	.btn_side {
		display: none;
	}
}

@media screen and (min-width: 1024px) {

}

</style>
