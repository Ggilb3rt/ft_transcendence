import type { IChannel, TChannelType, TRestrictUserTime, TMessage } from "typesChat";

// must protect if channel type is direct (remove possibility of add or remove user, ban, kick, change type, etc)
export class CChannel {
	private id: number;
	private ChanName: string;
	private type: TChannelType;
	private pass: string;
	private owner: number | null;
	public userList: number[];
	public adminList: number[];
	public banList: TRestrictUserTime[];
	public muteList: TRestrictUserTime[];
	public messages: TMessage[];
	private passMinLength: number;
	private maxUser: number;

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
		this.passMinLength = 0;
		this.maxUser = 20;
		// set some socket
	};

	// Helpers
	addMinutes(date: Date, minutes: number): Date {
		const dateCopy = new Date(date);
		dateCopy.setMinutes(date.getMinutes() + minutes);

		return dateCopy;
	}
	changeRestrictTime(userId:number, newDate: Date, isMute: boolean) {
		let userRestrict: TRestrictUserTime | undefined = undefined
		
		if (isMute)
			userRestrict = this.muteList.find((el) => el.userId == userId)
		else
			userRestrict = this.banList.find((el) => el.userId == userId)
		if (userRestrict != undefined)
			userRestrict.expire = newDate
	}
	getRestrictTime(userId:number, isBan: boolean, minutes?: number,): Date {
		let userRestrict: TRestrictUserTime | undefined = undefined
		
		if (isBan)
			userRestrict = this.banList.find((el) => el.userId == userId)
		else
			userRestrict = this.muteList.find((el) => el.userId == userId)
		if (userRestrict != undefined && minutes)
			return this.addMinutes(userRestrict.expire, minutes)
		return userRestrict ? userRestrict.expire : new Date()
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
	getId(): number { return this.id }
	getName(): string { return this.ChanName }
	getOwner(): number | null { return this.owner }
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
			this.userList.push(userId)
			return this.messages
		}
		return null
	}
	removeUserFromUserList(userId:number): boolean {
		const finded: number = this.userList.findIndex((el) => el == userId)

		if (finded) {
			this.userList.splice(finded, 1)
			return true
		}
		return false
	}
	changeChannelType(userId:number, newType:TChannelType, newPass?:string): boolean {
		if (this.canChangeType(userId, newType, newPass)) {
				// check with server
				this.type = newType
				if (newPass != undefined)
					this.pass = newPass
				return true
		}
		return false
	}
	canChangeType(userId:number, newType:TChannelType, newPass?:string) {
		if (this.isOwner(userId)) {
			if (newType != this.getType()) {
				if (newType == "direct")
					return false
				if (newType == "pass" && ((newPass && this.pass == newPass && newPass.length < this.passMinLength) || !newPass))
					return false
				return true
			}
		}
		return false
	}
	changePass(userId:number, newPass:string): boolean {
		if (this.canChangePass(userId, newPass)) {
			this.pass = newPass
			return true
		}
		return false
	}
	canChangePass(userId:number, newPass:string): boolean {
		if (this.isOwner(userId) && this.getType() == "pass")
			if (this.pass != newPass && newPass.length > this.passMinLength)
				return true
		return false
	}
	addAdmin(nominator:number, nominated:number): boolean {
		if (this.canAddAdmin(nominator, nominated)) {
			this.adminList.push(nominated)
			return true
		}
		return false
	}
	canAddAdmin(nominator:number, nominated:number): boolean {
		if ((this.isAdmin(nominator) || this.isOwner(nominator) ) && (!this.isAdmin(nominated) || !this.isOwner(nominated)))
			return true
		return false
	}
	removeAdmin(remover:number, removed:number): boolean {
		if (this.canRemoveAdmin(remover, removed)) {
			const find = this.adminList.findIndex(el => el == removed)
			if (find != -1)
				this.adminList.splice(find, 1)
			return true
		}
		return false
	}
	canRemoveAdmin(remover:number, removed:number): boolean {
		if (remover != removed && this.isOwner(remover) && this.isAdmin(removed) && removed != this.owner)
			return true
		return false
	}
	restrictUser(restrictor:number, restricted:number, onlyMute: boolean, newDate:Date): boolean {
		if (this.canRestrictUser(restrictor, restricted, onlyMute)) {
			let restrict: TRestrictUserTime = {
				userId: restricted,
				expire: newDate
			}
			// if (timeInMinutes) {
			// 	restrict = {
			// 			userId: restricted,
			// 			expire: this.addMinutes(new Date(), timeInMinutes)
			// 		}
			// }
			// else {
			// 	restrict = {
			// 		userId: restricted,
			// 		expire: new Date()
			// 	}
			// }
			if (onlyMute) {
				if (this.isMute(restricted))
					this.changeRestrictTime(restricted, newDate, false)
				else
					this.muteList.push(restrict)
				return true
			}
			else {
				if (this.isBan(restricted))
					this.changeRestrictTime(restricted, newDate, true)
				else
					this.banList.push(restrict)
				return true
			}
		}
		return false
	}
	canRestrictUser(restrictor:number, restricted:number, onlyMute: boolean): boolean {
		if ((this.isOwner(restrictor) && restrictor != restricted) || (this.isAdmin(restrictor) && !this.isOwner(restricted) && !this.isAdmin(restricted) && restricted != restrictor))
			return true
		return false
	}
	kickUser(kicker:number, kicked:number):boolean {
		if (this.canKickUser(kicker, kicked)) {
			const findUser = this.userList.findIndex((el) => el === kicked)
			this.userList.splice(findUser, 1)
			return true
		}
		return false
	}
	canKickUser(kicker:number, kicked:number):boolean {
		if ((this.isAdmin(kicker) || this.isOwner(kicker)) && !this.isOwner(kicked) && kicker != kicked && this.isInChannel(kicked))
			return true
		return false
	}
	unBan(banned_id: number) {
		const index = this.banList.findIndex((e) => {
			return e.userId === banned_id
		})
		if (index != -1) {
			this.banList.splice(index, 1)
		}
	}
	demote(demoted_id: number) {
		const index = this.adminList.findIndex((e) => {
			return e === demoted_id
		})
		if (index != -1) {
			this.adminList.splice(index, 1)
		}
	}
	sendMessage(message: TMessage): boolean {
		if (this.canSendMessage(message.sender)) {
			this.messages.push(message)
			return true
		}
		return false
	}
	canSendMessage(sender: number): boolean {
		if (this.isInChannel(sender) && !this.isBan(sender) && !this.isMute(sender))
			return true
		return false
	}
}