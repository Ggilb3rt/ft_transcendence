import { defineStore, mapGetters } from "pinia";
import { useUsersStore } from "./users";
import { ref } from 'vue'
import { io } from "socket.io-client"
import { CChannel } from "@/helpers/class.channel"
import type { IChannel, IChannelRestrict, TChannelType, TMessage } from "../../typesChat"
import { useUserStore } from "./user";

interface IChannelsStore {
	availableChannels: IChannelRestrict[]
	joinedChannels: IChannelRestrict[]
	openChan: CChannel[]
	currentChan: CChannel | null
	loading: boolean
	error: any
}


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
		new CChannel(10, "fake", "public", "", 1, [1,2,3, 7, 8, 9], [1, 2, 7, 8], [{userId: 3, expire: new Date(2023,0,1)}], [], [])
	])
	const currentChan = ref<CChannel | null>(null)
	const error = ref<string>("")

	const refsocket = ref(io('http://localhost:3000/chat', {
		withCredentials: true,
	}));

	const loading = ref<boolean>(false)
	const myRooms: string[] = [];

	function getChanIndex(rhs: number): number {
		return openChan.value.findIndex((elem) => {
			return elem.getId() === rhs
		})
	}

	// sockets emiters
	function emitMessage(chanId: number, content: string) {
		// j'aimerai bien savoir si il y a eu une erreur mais j'ai pas envie de casser la structure de Pierre
		// date que je recois n'est pas de type date (peut etre dû aux sockets)
		refsocket.value.emit("sendMessageToChannel", {channel_id: chanId, content: content, date: new Date()})
	}

	function emitDirectMessage(receiver: number, content: string) {
		// j'aimerai bien savoir si il y a eu une erreur mais j'ai pas envie de casser la structure de Pierre
		// date que je recois n'est pas de type date (peut etre dû aux sockets)
		refsocket.value.emit("sendMessageToChannel", {content: content, receiver, date: new Date()})
	}


	function emitPromoteUser(promoted_id: number, channel_id: number) {
		refsocket.value.emit("promote", {promoted_id: promoted_id, channel_id: channel_id})
	}

	function emitKickUser(channel_id: number, kicked_id: number) {
		refsocket.value.emit("kick", {channel_id: channel_id, kicked_id: kicked_id})
	}

	function emitRestrictUser(isMute: boolean, channel_id: number, banned_id: number, expires?: number) {
		// si le user est déjà ban il faut remplacer avec la nouvelle date
		let localExpires: Date | undefined
		if (expires)
			localExpires = currentChan.value?.getRestrictTime(banned_id, !isMute, expires)
		else
			localExpires = currentChan.value?.getRestrictTime(banned_id, !isMute)
		if (localExpires == undefined)
			localExpires = new Date()
		if (isMute)
			refsocket.value.emit("mute", {channel_id: channel_id, banned_id: banned_id, expires: localExpires})
		else
			refsocket.value.emit("ban", {channel_id: channel_id, banned_id: banned_id, expires: localExpires})
	}

	function emitJoin(chanId: number, pass?: string): boolean {

		let emitRes: boolean = false
		refsocket.value.emit("join", {channel_id: chanId, pass}, (res: any) => {
			emitRes = res.status
		})
		console.log("la reponse du join ", emitRes)
		// ici emitRes est false alors que le back me renvoi un status: true
		// je peux pas me rediriger correctement si ok
		// je suis bien ajouté dans la bdd mais pas dans en vrai
		return emitRes
	}
	
	function emitQuitChannel(channel_id: number) {
		refsocket.value.emit("quit", {channel_id: channel_id})
	}

	// sockets handlers
	function handleMessage(msg: TMessage) {
		if (!msg.isDirect) {
			console.log("la roome id quand je recois un message", msg.receiver)
			const index : number = getChanIndex(msg.receiver)
			console.log("son index", index)
			if (index === -1)
				return
			openChan.value[index].unBan(msg.sender)
			openChan.value[index].messages.push(msg)
		}
		else {
			//handle direct msg
		}
	}

	function createCustomMessage(admin: number, did: string, to: number, type: number): TMessage {
		if (type > -5) {
			const admin_nick: string = admin === userStore.user.id ? 'You' : usersStore.getUserNickById(admin);
			const user_nick: string = to === userStore.user.id ? 'you' : usersStore.getUserNickById(to);
			console.log("user _nick == ", user_nick, "to == ", to)

			const msg = `${admin_nick} ` + did + ` ${user_nick} !`;
			return {
				sender: type,
				receiver: to,
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
				receiver: to,
				msg,
				isDirect: false,
				date: new Date()
			}
		}
	}

	function handlePromotion(args: {
		promoted: number,
		channel_id: number,
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
		channel_id: number
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
		channel_id: number
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
		channel_id: number
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
		channel_id: number
		}) {
			const index: number = getChanIndex(args.channel_id)
			if (index === -1) {
				return
			}
			openChan.value[index].userList.push(args.new_client)
			openChan.value[index].messages.push(createCustomMessage(args.new_client, 'joined', args.channel_id, -5))
		}

	function handleQuit(args: {
		client_quit: number,
		channel_id: number
	})
		{
			const index: number = getChanIndex(args.channel_id)
			if (index === -1) {
				return
			}
			openChan.value[index].userList.push(args.client_quit)
			openChan.value[index].messages.push(createCustomMessage(args.client_quit, 'left', args.channel_id, -6))
		}

	function handleTypeChange(args: {channel_id: number, type: TChannelType, user_id: number, pass?: string}){
		const {channel_id, type, user_id, pass} = args;
		const index: number = getChanIndex(args.channel_id)
		if (index === -1) {
			return
		}
        if (type != "direct" && type != "pass" && type != "private" && type != "public")
			return
		openChan.value[index].changeChannelType(user_id, type, pass)
	}

	function handleDemote(arg: {channel_id: number, demoted_id: number, id: number}) {
		const { channel_id, demoted_id, id} = arg;

		const index: number = getChanIndex(channel_id)
		if (index === -1) {
			return
		}
		openChan.value[index].demote(demoted_id)
		openChan.value[index].messages.push(createCustomMessage(demoted_id, 'demoted', id, -1))
	}

	async function setup() {
		refsocket.value.emit('getMyRooms', (res: boolean | any) => {
			if (res == false) {
				// throw new blabla
			}
			else {
					availableChannels.value = res.availableChannels
					joinedChannels.value = res.joinedChannels
					joinedChannels.value.push({name: "fake", id: 10})
				}
		})
		refsocket.value.on('messageSentToChannel', handleMessage)
		refsocket.value.on('directMessageSent', handleMessage)
		refsocket.value.on('typeChanged', handleTypeChange)
		refsocket.value.on('promote', handlePromotion)
		refsocket.value.on('demoted', handleDemote)
		refsocket.value.on('ban', handleBan)
		refsocket.value.on('kick', handleKick)
		refsocket.value.on('mute', handleMute)
		refsocket.value.on('join', handleJoin)
		refsocket.value.on('quit', handleQuit)
	}
		// Initialise
		async function getChansLists() {
			loading.value = true
			try {
				// la reponse va être un obj avec deux tableaux, un avaec les chanRestrict dispo et un avec ceux dans lequel je me trouve
				// const response = await fetch("http://localhost:3000/channels", {credentials: "include"})
				
			setup()
			} catch (error: any) {
				const tempErr = JSON.parse(error.message)
				error.value = tempErr.body
			} finally {
				loading.value = false
			}
		}
		async function getChan(id: number) {
			loading.value = true
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
					console.log("MY OPENED CHANNEL: ", data);
					// check if chan exist
						// update data
					const chanIndex = joinedChannels.value.find((el) => el.id == data.id)
					console.log("complete channel = ", data)
					console.log("typeof ban.expired = ", typeof data.banList[0].expire)
					console.log("typeof ban.mute = ", typeof data.muteList[0].expire)
					if (chanIndex != undefined) {
						let newChan = new CChannel(
							data.id, 
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
						console.log("newChan ", newChan)
						openChan.value.push(newChan)
					}
				}
			} catch (error: any) {
				const tempErr = JSON.parse(error.message)
				error.value = tempErr.body
			} finally {
				loading.value = false
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
		function isChanInList(id: number): boolean {
			return openChan.value.find((el) => el.id == id) ? true : false
		}
		
		// Getter
		function selectCurrentChan(id: number) {
			if (!isChanInList(id))
				return
			const found = openChan.value.find((el) => el.id == id)
			if (found)
				currentChan.value = found
		}
		function unselectCurrentChan() {
			currentChan.value = null
		}
		function getChanListForSideBar(isJoin: boolean): {id: string, name: string}[] {
			let list: {id: string, name: string}[] = []
			console.log("create side navbar info oooooooooooo", isJoin )
			if (isJoin) {
				joinedChannels.value.forEach((el: IChannelRestrict) => {
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
		loading,
		error,
		getChansLists,
		getChan,
		createChan,
		selectCurrentChan,
		unselectCurrentChan,
		getUsersInChannel,
		getChanListForSideBar,
		// emits
		emitMessage,
		emitPromoteUser,
		emitJoin,
		emitKickUser,
		emitRestrictUser,
		emitQuitChannel
	}
})