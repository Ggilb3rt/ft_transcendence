import { defineStore } from "pinia";
import { useUsersStore } from "./users";
import { ref } from 'vue'
import { io } from "socket.io-client"
import { CChannel } from "@/helpers/class.channel"
import type { IChannel, IChannelRestrict, TMessage } from "../../typesChat"

interface IChannelsStore {
	availableChannels: IChannelRestrict[]
	joinedChannels: IChannelRestrict[]
	openChan: CChannel[]
	currentChan: CChannel | null
	error: any
}


let channelMsgs: TMessage[] = [
	{
		sender: 2,
		receiver: 3,
		msg: "lol",
		isDirect: false,
		date: new Date()
	},
	{
		sender: 1,
		receiver: 3,
		msg: "pouet un message tres long pour voir ce que ca fait tout autour, poour pousser le btn challenge et l'img",
		isDirect: false,
		date: new Date()
	},
	{
		sender: 3,
		receiver: 3,
		msg: "internet",
		isDirect: false,
		date: new Date()
	},
]


export const useChannelsStore = defineStore('channels', () => {
	
	// const socket = ref(io('http://localhost:3000/chat'))

	// ==> se connecte auto au serveur et declenche handleconnection // cote serveur se fait join ses rooms
	// --> recupere la liste des rooms ou il est
	// -->
	const availableChannels = ref<IChannelRestrict[]>([])
	const joinedChannels = ref<IChannelRestrict[]>([])
	const openChan = ref<CChannel[]>([
		new CChannel(10, "le Premier chan", "public", "", 1, [1,2,3], [1, 2], [{userId: 3, expire: new Date(2023,0,1)}], [], channelMsgs)
	])
	const currentChan = ref<CChannel | null>(null)
	const error = ref<string>("")

		// Initialise
		async function getChansLists() {
			try {
				// la reponse va être un obj avec deux tableaux, un avaec les chanRestrict dispo et un avec ceux dans lequel je me trouve
				const response = await fetch("http://localhost:3000/channels", {credentials: "include"})
				let data;
				if (response.status >= 200 && response.status < 300)
					data = await response.json()
				else
					throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
				if (data) {
					// chanRestrictList.value = data
					availableChannels.value = data.availableChannels
					joinedChannels.value = data.joinedChannels
					// data.joinedChannels.forEach((chan: IChannelRestrict) => {
					// 	// create chan instance with default values
					// 	let newChan = new CChannel(Number(chan.href), chan.name, "public", "", 0, [], [], [], [], [])
					// 	openChan.value.push(newChan)
					// })
				}
			} catch (error: any) {
				const tempErr = JSON.parse(error.message)
				error.value = tempErr.body
			}
		}
		async function getChan(id: number) {
			if (isChanInList(id))
				return
			try {
				const response = await fetch(`http://localhost:3000/channels/${id}`, {credentials: "include"})
				let data: IChannel;
				if (response.status >= 200 && response.status < 300)
					data = await response.json()
				else
					throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
				if (data) {
					// check if chan exist
						// update data
					const chanIndex = joinedChannels.value.find((el) => Number(el.href) == data.id)
					if (chanIndex != undefined) {
						let newChan = new CChannel(
							data.id || 0, 
							data.ChanName, 
							data.type,
							data.pass || "",
							data.owner,
							data.userList,
							data.adminList,
							data.banList,
							data.muteList,
							data.messages)
							openChan.value.push(newChan)
					}
				}
			} catch (error: any) {
				const tempErr = JSON.parse(error.message)
				error.value = tempErr.body
			}
		}

		// Checker
		function isChanInList(id: number): boolean {
			return openChan.value.find((el) => el.id == id) ? true : false
		}
		// Getter
		function selectCurrentChan(id: number) {
			if (!isChanInList(id))
				return
			const finded = openChan.value.find((el) => el.id == id)
			if (finded)
				currentChan.value = finded
		}
		function unselectCurrentChan() {
			currentChan.value = null
		}
		function getUsersInChannel(): number[] {
			// const usersStore = useUsersStore()

			if (currentChan.value) {
				// try {
				// 	const list = await usersStore.getUsersListForChat(currentChan.value.getUserList())
				// 	return list ? list : []
				// } catch {
				// 	error.value = "Can't get users in channel"
				// }
				return currentChan.value.getUserList()
			}
			return []
		}

		// initSocket()

	return {
		chanRestrictList,
		openChan,
		currentChan,
		error,
		getChansLists,
		getChan,
		selectCurrentChan,
		unselectCurrentChan,
		getUsersInChannel,
	}
})