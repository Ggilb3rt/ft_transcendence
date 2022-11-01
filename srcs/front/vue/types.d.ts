/// User(s) infos ///
// Connected user
export interface IUser {
    id: number;
    two_factor_auth: boolean;
    first_name: string;
    last_name: string;
    nickname: string;
    avatar_url: string | ArrayBuffer;
    ranking: number;
    wins: number;
    loses: number;
    friends: number[];
    bans: number[];
    bannedBy: number[];
    invites: number[];
    match_history: IMatchHistory[];
    matches: IMatch[] | null;
  }

// Minimum valuable informations for a user (ie: use for list of users)
export interface IOtherUserRestrict {
    id: number;
    nickname: string;
    avatar_url: string;
}

// Other user infos (ie: use in dashboard)
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

// Match prints in dashboard
export interface IMatchHistory {
  opponent: number;
  win: boolean;
  myScore: number;
  opponentScore: number;
  date: Date | null;
}

// Match as they are stored in bdd
export interface IMatch {
  id: number;
  player_left_id: number;
  player_right_id: number;
  score_left: number;
  score_right: number;
  date: Date;
}



/// Socket Status ///
export type status = "available" | "disconnected" | "inGame"

// Status of each users, use to allowed or not some actions
export interface ISocketStatus {
  socketId: string;
  userId: number;
  userStatus: status;
}



/// Side nav ///
/// Used with SideNav.vue component ///

export interface ISideNavData {
	name: string;
	isOpen: boolean;
	items: [Object]
}

export interface ISideNavDataItem {
	name: string;
	href: string;
	children?: [ISideNavDataItem] | null
	isOpen?: boolean;
}
