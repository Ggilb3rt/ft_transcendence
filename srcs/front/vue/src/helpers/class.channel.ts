import type { IChannel, TChannelType, TRestrictUserTime, TMessage } from "typesChat";

// must protect if channel type is direct (remove possibility of add or remove user, ban, kick, change type, etc)
export class CChannel {
	id: number;
	ChanName: string;
	type: TChannelType;
	pass: string;
	owner: number | null;
	userList: number[];
	adminList: number[];
	banList: TRestrictUserTime[];
	muteList: TRestrictUserTime[];
	messages: TMessage[];
	passMinLength: number;
	maxUser: number;

	constructor(
		id:number,
		name: string,
		type: TChannelType,
		pass: string,
		owner: number | null,
		userList: number[],
		adminList: number[],
		banList: TRestrictUserTime[],
		muteList: TRestrictUserTime[],
		messages: TMessage[]
	) {
		this.id = id;
		this.ChanName = name;
		this.type = type;
		this.pass = pass;
		this.owner = owner;
		this.userList = userList;
		this.adminList = adminList;
		this.banList = banList;
		this.muteList = muteList;
		this.messages = messages;
		this.passMinLength = 5;
		this.maxUser = 20;
		// set some socket
	};

	// Helpers
	addMinutes(date: Date, minutes: number): Date {
		const dateCopy = new Date(date);
		dateCopy.setMinutes(date.getMinutes() + minutes);

		return dateCopy;
	}
	changeRestrictTime(userId:number, minutes: number, isBan: boolean) {
		let userRestrict: TRestrictUserTime | undefined = undefined
		
		if (isBan)
			userRestrict = this.banList.find((el) => el.userId == userId)
		else
			userRestrict = this.banList.find((el) => el.userId == userId)
		if (userRestrict != undefined)
			userRestrict.expire = this.addMinutes(userRestrict.expire, minutes)
	}
	async checkWithServer(url: string, option: Object): Promise<boolean> {
		const response = await fetch(url, { credentials: "include"})
		if (response.status >= 200 && response.status < 300) {
			const data = await response.json()
			// set l'instance
		}
		else {
			throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
		}
		return false
	}
	// Getters
	getName(): string { return this.ChanName }
	getType(): TChannelType { return this.type }
	getMessages(): TMessage[] { return this.messages }
	getUserList(): number[] { return this.userList }
	// Checkers
	isPassValid(testString: string): boolean { return this.pass == testString }
	isInChannel(userId:number): boolean { return this.userList.find(el => el == userId) ? true : false }
	isOwner(userId:number): boolean { return userId == this.owner ? true : false }
	isAdmin(userId:number): boolean { return this.adminList.find(el => el == userId) ? true : false }
	isMute(userId:number): boolean { return this.muteList.find(el => el.userId == userId) ? true : false }
	endOfMute(userId:number): Date | null {
			const mutedUser: TRestrictUserTime | undefined = this.muteList.find(el => el.userId == userId)
			return mutedUser ? mutedUser.expire : null
	}
	isBan(userId:number): boolean { return this.banList.find(el => el.userId == userId) ? true : false}
	endOfBan(userId:number): Date | null {
		const banedUser: TRestrictUserTime | undefined = this.banList.find(el => el.userId == userId)
		return banedUser ? banedUser.expire : null
	}
	// Setters
	joinChannel(userId:number): TMessage[] | null {
		if (!this.isInChannel(userId) && !this.isBan(userId)) {
			// check with server
			// send Message "welcome to userId.name"
			this.userList.push(userId)
			return this.messages
		}
		return null
	}
	leaveChannel(userId:number): boolean {
		// check user is in this.userList
			// remove userId from this.userList
			// return true
		// return false
		return false
	}
	changeChannelType(userId:number, newType:TChannelType, newPass?:string): boolean {
		if (this.isOwner(userId)) {
			if (newType != this.getType()) {
				if (newType == "direct")
					return false
				if (newType == "pass" && ((newPass && this.pass == newPass && newPass.length < this.passMinLength) || !newPass))
					return false
				// check with server
				this.type = newType
				if (newPass != undefined)
					this.pass = newPass
				return true
			}
		}
		return false
	}
	changePass(userId:number, newPass:string): boolean {
		if (this.isOwner(userId) && this.getType() == "pass") {
			if (this.pass != newPass && newPass.length > this.passMinLength) {
				// check with server
				this.pass = newPass
				return true
			}
		}
		return false
	}
	addAdmin(nominator:number, nominated:number): boolean {
		if (this.isAdmin(nominator) && !this.isAdmin(nominated)) {
			// check with server
			// send message "nominated.name is a new administrator now, kneel down ! (please don't)"
			this.adminList.push(nominated)
			return true
		}
		return false
	}
	removeAdmin(remover:number, removed:number): boolean {
		if (remover != removed && this.isOwner(remover) && this.isAdmin(removed) && removed != this.owner) {
			// check with server
			const find = this.adminList.findIndex(el => el == removed)
			this.adminList.splice(find, 1)
			return true
		}
		return false
	}
	restrictUser(restrictor:number, restricted:number, onlyMute: boolean, timeInMinutes:number): boolean {
		if (this.isAdmin(restrictor) && !this.isOwner(restricted) && restricted != restrictor) {
			const restrict: TRestrictUserTime = {
				userId: restricted,
				expire: this.addMinutes(new Date(), timeInMinutes)
			}
			if (onlyMute) {
				if (this.isMute(restricted))
					this.changeRestrictTime(restricted, timeInMinutes, false)
				// check with server
				this.muteList.push(restrict)
				return true
			}
			else {
				if (this.isBan(restricted))
					this.changeRestrictTime(restricted, timeInMinutes, true)
				// check with server
				this.banList.push(restrict)
				return true
			}
		}
		return false
	}
	kickUser(kicker:number, kicked:number):boolean {
		if (this.isAdmin(kicker) && !this.isOwner(kicked) && kicker != kicked && this.isInChannel(kicked)) {
			// check with server
			// send message "kicked.name was kicked"
			const findUser = this.userList.findIndex((el) => el === kicked)
			this.userList.splice(findUser, 1)
			return true
		}
		return false
	}
	sendMessage(message: TMessage): boolean {
		if (this.isInChannel(message.sender) && !this.isBan(message.sender) && !this.isMute(message.sender)) {
			// send to back
			console.log("message send to CChanel", message.msg)
			this.messages.push(message)
			return true
		}
		return false
	}
}