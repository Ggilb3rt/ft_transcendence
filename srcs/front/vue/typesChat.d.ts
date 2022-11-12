
export type TChannelType = "public" | "private" | "pass" | "direct"

export type TRestrictUserTime = {
	userId: number;
	expire: Date;
}

export type TChannelUser = {
	id: number;
	isAdmin: boolean;
}

export interface IChannel {
	id: number;
	ChanName: string;
	type: TChannelType;
	pass?: string;
	owner: number | null;
	userList: number[];
	adminList: number[];
	banList: TRestrictUserTime[];
	muteList: TRestrictUserTime[];
	messages: TMessage[];
}

export interface IChannelRestrict {
	name: string;
	id: number;
}

// remplacer tag et img par userId, permet de le retrouver dans le store usersList
// en vrai pas sur parceque ça va faire plein d'appel au store... je sais pas trop en vrai
export type TMessage = {
	sender: number,
	receiver: number,
	msg: string,
	isDirect: boolean,
	date: Date
}