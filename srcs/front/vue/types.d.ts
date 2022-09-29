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
    blocks: number[];
    invites: number[];
    match_history: IMatchHistory[]; 
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
}

export interface IMatchHistory {
  opponent: number;
  win: boolean;
  myScore: number;
  opponentScore: number;
}