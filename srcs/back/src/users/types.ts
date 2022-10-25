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

export { userFront, userRestrict, otherFormat}