import { defineStore } from "pinia";
import { useUsersStore } from "./users";
import { ref } from 'vue'
import { io } from "socket.io-client"
import { CChannel } from "@/helpers/class.channel"
import type { IChannelRestrict, TMessage } from "../../typesChat"

interface IChannelsStore {
	chanRestrictList: IChannelRestrict[]
	chanList: CChannel[]
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
	
	const chanRestrictList =  ref<IChannelRestrict[]>([])
	const chanList = ref<CChannel[]>([
		new CChannel(3, "le Premier chan", "public", "", 1, [1,2,3], [1, 2], [{userId: 3, expire: new Date(2023,0,1)}], [], channelMsgs)
	])
	const currentChan = ref<CChannel | null>(null)
	const error = ref<string>("")

		// Initialise
		async function getChanRestrictList() {
			try {
				// la reponse va être un obj avec deux tableaux, un avaec les chanRestrict dispo et un avec ceux dans lequel je me trouve
				const response = await fetch("http://localhost:3000/channels", {credentials: "include"})
				let data;
				if (response.status >= 200 && response.status < 300)
					data = await response.json()
				else
					throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
				if (data)
					chanRestrictList.value = data
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
				let data;
				if (response.status >= 200 && response.status < 300)
					data = await response.json()
				else
					throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
				if (data) {
					let newChan = new CChannel(
						data.id, 
						data.name, 
						data.type,
						data.pass,
						data.owner,
						data.userList,
						data.adminList,
						data.banList,
						data.muteList,
						data.messages)
					chanList.value.push(newChan)
				}
			} catch (error: any) {
				const tempErr = JSON.parse(error.message)
				error.value = tempErr.body
			}
		}

		// Checker
		function isChanInList(id: number): boolean {
			return chanList.value.find((el) => el.id == id) ? true : false
		}
		// Getter
		function selectCurrentChan(id: number) {
			if (!isChanInList(id))
				return
			const finded = chanList.value.find((el) => el.id == id)
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
	
	return {
		chanRestrictList,
		chanList,
		currentChan,
		error,
		getChanRestrictList,
		getChan,
		selectCurrentChan,
		unselectCurrentChan,
		getUsersInChannel,
	}
})