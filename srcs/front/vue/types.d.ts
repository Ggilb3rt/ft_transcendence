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
    ban_users_ban_users_idTousers: number[];
    invites: number[];
    match_history: IMatchHistory[];
    match_match_player_left_idTousers: IMatch[] | null;
    match_match_player_right_idTousers: IMatch[] | null;
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
    match_match_player_left_idTousers: IMatch[] | null;
    match_match_player_right_idTousers: IMatch[] | null;
}

export interface IMatchHistory {
  opponent: number;
  win: boolean;
  myScore: number;
  opponentScore: number;
  date: Date;
}

export interface IMatch {
  id: number;
  player_left_id: number;
  player_right_id: number;
  score_left: number;
  score_right: number;
  date: Date;
}

// interface userRelation {
//   id: number
// }
