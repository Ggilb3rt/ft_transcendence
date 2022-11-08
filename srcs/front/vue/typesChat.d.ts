
export type TChannelType = "public" | "private" | "pass" | "direct"

export type TRestrictUserTime = {
	userId: number;
	expire: Date;
}

export interface IChannel {
	id: number;
	// href: string; // equivalent of id ??
	name: string;
	type: TChannelType;
	userList: number[];
	owner: number | null;
	adminList: number[];
	banList: TRestrictUserTime[];
	muteList: TRestrictUserTime[];
	pass?: string;
	messages: TMessage[];
}

export interface IChannelRestrict {
	name: string;
	href: string;
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