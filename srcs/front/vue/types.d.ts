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
    friends: userRelation[];
    blocks: userRelation[];
    invites: userRelation[];
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
    friends: userRelation[];
    match_history: IMatchHistory[]; 
}

export interface IMatchHistory {
  opponent: number;
  win: boolean;
  myScore: number;
  opponentScore: number;
}

interface userRelation {
  id: number
}
