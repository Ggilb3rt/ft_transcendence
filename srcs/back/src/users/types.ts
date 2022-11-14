import { match, users } from "@prisma/client"

type userFront = users & {
    friends: number[],
    bannedBy: number[],
    bans: number[],
    matches: match[],
    invites: number[]
  }

class userRestrict {
    id: number;
    nickname: string;
}

class otherFormat {
    id: number;
    nickname: string;
    first_name: string;
    last_name: string;
    ranking: number;
    wins: number;
    loses: number;
    friends: number[];
    matches: match[];
}

type TChannelType = "public" | "private" | "pass" | "direct"


class TRestrictUserTime {
	userId: number;
	expire: Date;
}

class TMessage {
	sender: number;
	receiver: number;
	msg: string;
	isDirect: boolean;
	date: Date
}

class TMessageRestrict {
    msg:string;
    date: Date;
}

class TChannel {
    id: number;
	ChanName: string;
	type: TChannelType;
	userList: number[];
	owner: number | null;
	adminList: number[];
	banList: TRestrictUserTime[];
	muteList: TRestrictUserTime[];
	pass?: string;
	messages: TMessage[];
}

class TChannelRestrict {
	name: string;
	id: number;
}

export { userFront, userRestrict, otherFormat, TChannelType, TMessage, TRestrictUserTime, TChannel, TChannelRestrict, TMessageRestrict }