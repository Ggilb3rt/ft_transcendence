import { match, users } from "@prisma/client"

type userFront = users & {
    friends: number[],
    bannedBy: number[],
    bans: number[],
    matches: match[],
    invites: number[]
  }

type userRestrict = {
    id: number,
    avatar_url: string,
    nickname: string
}

type otherFormat = {
    id: number,
    avatar_url: string,
    nickname: string,
    first_name: string,
    last_name: string,
    ranking: number,
    wins: number,
    loses: number,
    friends: number[],
    matches: match[],
}

type TChannelType = "public" | "private" | "pass" | "direct"


type TRestrictUserTime = {
	userId: number;
	expire: Date;
}

type TMessage = {
	sender: number,
	receiver: number,
	msg: string,
	isDirect: boolean,
	date: Date
}

type TChannel = {
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


export { userFront, userRestrict, otherFormat, TChannelType, TMessage, TRestrictUserTime, TChannel}