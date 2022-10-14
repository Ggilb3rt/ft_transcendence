export type status = "available" | "disconnected" | "inGame"

export interface IUser {
    id: number;
    two_factor_auth: boolean;
    first_name: string;
    last_name: string;
    nickname: string;
    avatar_url: string;
    ranking: number;
    wins: number;
    loses: number;
    friends: number[];
    bans: number[];
    invites: number[];
    match_history: IMatchHistory[];
    matches: IMatch[] | null;
  }

export interface IOtherUserRestrict {
    id: number;
    nickname: string;
    avatar_url: string;
}

export interface IOtherUser {
    id: number;
    first_name: string;
    last_name: string;
    nickname: string;
    avatar_url: string;
    ranking: number;
    wins: number;
    loses: number;
    friends: number[];
    match_history: IMatchHistory[];
    matches: IMatch[] | null;
}

export interface IMatchHistory {
  opponent: number;
  win: boolean;
  myScore: number;
  opponentScore: number;
  date: Date | null;
}

export interface IMatch {
  id: number;
  player_left_id: number;
  player_right_id: number;
  score_left: number;
  score_right: number;
  date: Date;
}

export interface ISocketStatus {
  socketId: string;
  userId: number;
  userStatus: status;
}