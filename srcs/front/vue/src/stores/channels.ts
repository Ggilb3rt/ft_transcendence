import { defineStore, mapGetters } from "pinia";
import { useUsersStore } from "./users";
import { ref } from 'vue'
import { io } from "socket.io-client"
import { CChannel } from "@/helpers/class.channel"
import type { IChannel, IChannelRestrict, TMessage } from "../../typesChat"
import { useUserStore } from "./user";

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
		receiver: "3",
		msg: "lol",
		isDirect: false,
		date: new Date()
	},
	{
		sender: 1,
		receiver: "3",
		msg: "pouet un message tres long pour voir ce que ca fait tout autour, poour pousser le btn challenge et l'img",
		isDirect: false,
		date: new Date()
	},
	{
		sender: 3,
		receiver: "3",
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
	const usersStore = useUsersStore();
	const userStore = useUserStore();
	const availableChannels = ref<IChannelRestrict[]>([])
	const joinedChannels = ref<IChannelRestrict[]>([])
	const openChan = ref<CChannel[]>([
		new CChannel("10", "fake", "public", "", 1, [1,2,3, 7, 8, 9], [1, 2, 7, 8], [{userId: 3, expire: new Date(2023,0,1)}], [], channelMsgs)
	])
	const currentChan = ref<CChannel | null>(null)
	const error = ref<string>("")

	const refsocket = ref(io('http://localhost:3000/chat', {
		withCredentials: true,
	}));

	const myRooms: string[] = [];

	function getChanIndex(rhs: string): number {
		return openChan.value.findIndex((elem) => {
			return elem.getId() === rhs
		})
	}

	// sockets emiters
	function emitJoin(chanId: string): boolean {
		let emitRes: boolean = false
		refsocket.value.emit("join", availableChannels.value.find((el) => el.id == ) chanId, (res: any) => {
			emitRes = res.status
		})
		return emitRes
	}

	// sockets handlers
	function handleMessage(msg: TMessage, roomId: string) {
		const index : number = msg.isDirect ? getChanIndex('u' + roomId) : getChanIndex(roomId)
		if (index === -1)
			return
		openChan.value[index].messages.push(msg)
	}

	function createCustomMessage(admin: number, did: string, type: number, to: number): TMessage {
		if (type > -5) {
			const admin_nick: string = admin === userStore.user.id ? 'You' : usersStore.getUserNickById(admin);
			const user_nick: string = to === userStore.user.id ? 'you' : usersStore.getUserNickById(to);
			const msg = `${admin_nick} ` + did + ` ${user_nick} !`;
			return {
				sender: type,
				receiver: to.toString(),
				msg,
				isDirect: false,
				date: new Date()
			}
		}
		else {
			const user_nick: string = admin === userStore.user.id ? 'You' : usersStore.getUserNickById(admin)
			const msg = `${user_nick}  ${did} the channel`
			return {
				sender: type,
				receiver: to.toString(),
				msg,
				isDirect: false,
				date: new Date()
			}
		}
	}

	function handlePromotion(args: {
		promoted: number,
		channel_id: string,
		promoted_by: number	})
		
		{
		const index: number = getChanIndex(args.channel_id)
		if (index === -1) {
			return
		}
		openChan.value[index].adminList.push(args.promoted)
		openChan.value[index].messages.push(createCustomMessage(args.promoted_by, 'promoted', args.promoted, -1))
	}

	function handleBan(args: {
		banned_id: number,
		banned_by: number,
		expires: Date,
		channel_id: string
		}) 
		{
			const index: number = getChanIndex(args.channel_id)
			if (index === -1) {
				return
			}
			openChan.value[index].banList.push({userId: args.banned_id, expire: args.expires})
			openChan.value[index].messages.push(createCustomMessage(args.banned_by, 'banned', args.banned_by, -2))
		}

	function handleMute(args: {
		banned_id: number,
		banned_by: number,
		expires: Date,
		channel_id: string
		}) 
		{
			const index: number = getChanIndex(args.channel_id)
			if (index === -1) {
				return
			}
			openChan.value[index].muteList.push({userId: args.banned_id, expire: args.expires})
			openChan.value[index].messages.push(createCustomMessage(args.banned_by, 'muted', args.banned_by, -3))
		}
		
	function handleKick(args: {
		banned_id: number,
		banned_by: number,
		channel_id: string
		}) 
		{
			const index: number = getChanIndex(args.channel_id)
			if (index === -1) {
				return
			}
			// openChan.value[index].banList.push()
			openChan.value[index].messages.push(createCustomMessage(args.banned_by, 'kicked', args.banned_by, -4))
		}

	function handleJoin(args: {
		new_client: number,
		channel_id: string
		}) {
			const index: number = getChanIndex(args.channel_id)
			if (index === -1) {
				return
			}
			openChan.value[index].userList.push(args.new_client)
			openChan.value[index].messages.push(createCustomMessage(args.new_client, 'joined', parseInt(args.channel_id), -5))
		}

	function handleQuit(args: {
		client_quit: number,
		channel_id: string
	})
		{
			const index: number = getChanIndex(args.channel_id)
			if (index === -1) {
				return
			}
			openChan.value[index].userList.push(args.client_quit)
			openChan.value[index].messages.push(createCustomMessage(args.client_quit, 'left', parseInt(args.channel_id), -6))
		}

	async function setup() {
		refsocket.value.emit('getMyRooms', (res: any) => {
			res.forEach((elem: string) => {
				myRooms.push(elem)
				console.log('Adding room id: ', elem)
			})
		})
		refsocket.value.on('messageSentToChannel', handleMessage)
		refsocket.value.on('directMessageSent', handleMessage)
		refsocket.value.on('promote', handlePromotion)
		refsocket.value.on('ban', handleBan)
		refsocket.value.on('kick', handleKick)
		refsocket.value.on('mute', handleMute)
		refsocket.value.on('join', handleJoin)
		refsocket.value.on('quit', handleQuit)
	}
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
					availableChannels.value = data.availableChannels
					joinedChannels.value = data.joinedChannels
					joinedChannels.value.push({name: "fake", id: "10"})
				}
			setup()
			} catch (error: any) {
				const tempErr = JSON.parse(error.message)
				error.value = tempErr.body
			}
		}
		async function getChan(id: string) {
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
					const chanIndex = joinedChannels.value.find((el) => el.id == data.id)
					if (chanIndex != undefined) {
						let newChan = new CChannel(
							data.id || "", 
							data.ChanName, 
							data.type,
							data.pass || "",
							data.owner,
							data.userList,
							data.adminList,
							data.banList,
							data.muteList,
							data.messages
						)
						openChan.value.push(newChan)
					}
				}
			} catch (error: any) {
				const tempErr = JSON.parse(error.message)
				error.value = tempErr.body
			}
		}
		async function createChan(newChan: IChannel): Promise<boolean> {
			if (newChan.id) {
				joinedChannels.value.push({
					name: newChan.ChanName,
					id: newChan.id
				})
				await getChan(newChan.id)
				return true
			}
			return false
		}

		// Checker
		function isChanInList(id: string): boolean {
			return openChan.value.find((el) => el.id == id) ? true : false
		}
		// Getter
		function selectCurrentChan(id: string) {
			if (!isChanInList(id))
				return
			const finded = openChan.value.find((el) => el.id == id)
			if (finded)
				currentChan.value = finded
		}
		function unselectCurrentChan() {
			currentChan.value = null
		}
		function getChanListForSideBar(isJoin: boolean): IChannelRestrict[] {
			let list: IChannelRestrict[] = []
			console.log("create side navbar info oooooooooooo", isJoin )
			if (isJoin) {
				joinedChannels.value.forEach((el: IChannelRestrict) => {
					console.log("inJoin")
					list.push({
						name: el.name,
						id: `/chat/room/${el.id}`
					})
				})
			}
			else {
				availableChannels.value.forEach((el: IChannelRestrict) => {
					console.log("inAvailable")
					list.push({
						name: el.name,
						id: `/chat/room/${el.id}`
					})
				})
			}
			console.log("la liiiiiiiiiiiiiiiiiiiiistetteeeteeteeee ", list)
			return list
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
		// ! probablement pas necessaire de les ouvrirs
		availableChannels,
		joinedChannels,
		// ! fin
		openChan,
		currentChan,
		error,
		getChansLists,
		getChan,
		createChan,
		selectCurrentChan,
		unselectCurrentChan,
		getUsersInChannel,
		getChanListForSideBar,
		// emits
		emitJoin
	}
})