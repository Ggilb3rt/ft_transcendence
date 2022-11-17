import { defineStore } from "pinia";
import type { IMatchHistory, IUser } from "../../types";
import { mande, defaults } from "mande";

defaults.credentials = "include";

export enum setStatus {
  connected = 0,
  need2fa,
  needLogin,
  first_co
}

export type constatus =
  | setStatus.connected
  | setStatus.need2fa
  | setStatus.needLogin
  | setStatus.first_co;

export interface IUserStoreState {
  user: IUser;
  loading: boolean;
  error: any | null;
  connected: boolean;
  twoFactorAuth: boolean;
  conStatus: constatus;
}

export const useUserStore = defineStore({
  id: "user",
  state: (): IUserStoreState => ({
    user: {} as IUser,
    loading: false,
    error: null,
    connected: false,
    twoFactorAuth: false,
    conStatus: setStatus.needLogin,
  }),
  getters: {
    
    
    
    
  },
  actions: {
    
    getUserNick(): string {
      return `${this.user.nickname}`;
    },
    getFriendsList(): number[] {
      return this.user.friends;
    },
    getWinRate(): number {
      const calc = (this.user.wins / (this.user.loses + this.user.wins) * 100);
      return isNaN(calc) ? 0 : calc
    },
    getUserRank(): string {
      switch (this.user.ranking) {
        case 0:
          return "Pipou";
          break;
        case 1:
          return "Adept";
          break;
        case 2:
          return "Pongger";
          break;
        case 3:
          return "Your body is ready";
          break;
        case 4:
          return "Master";
          break;
        case 5:
          return "God";
          break;
        default:
          return "Prrrrt";
          break;
      }
    },
    setUserNick(newTag: string) {
      if (this.user) this.user.nickname = newTag;
    },
    set2FAConnect(value: boolean) {
      this.twoFactorAuth = value;
    },
    change2FA() {
      this.user.two_factor_auth = !this.user.two_factor_auth;
    },
    getStatus(): constatus {
      return this.conStatus;
    },
    changeStatus(status: constatus) {
      this.conStatus = status;
    },
    async getUser(data: any) {
      let winrate:number = 0
        if (data) {
          this.user = data
          
          if (this.user) {
            this.user.avatar_url = `http://localhost:3000/users/${this.user.id}/avatar`
            winrate = this.getWinRate()
            this.user.ranking = Math.round(this.getWinRate()/20)
            if (!this.user.match_history && !this.error) {
              this.user.match_history = new Array();
              if (this.user.matches) {
                this.user.matches.forEach((el) => {
                  const selectOpponent = el.player_left_id != this.user.id ? el.player_left_id : el.player_right_id
                  const selectOpponentScore = el.player_left_id != this.user.id ? el.score_left : el.score_right
                  const myScore = el.player_left_id == this.user.id ? el.score_left : el.score_right
                  const match: IMatchHistory = {
                    opponent: selectOpponent,
                    myScore:myScore,
                    opponentScore: selectOpponentScore,
                    win: myScore > selectOpponentScore,
                    date: new Date(),
                  };
                  this.user.match_history.push(match);
                });
                this.user.matches = null;
              }
            }
          }
        }
    },

    
    isFriends(id: number): boolean {
      if (this.user.friends) return this.user.friends.includes(id);
      return false;
    },
    isBan(id: number): boolean {
      if (this.user.bans) return this.user.bans.includes(id);
      return false;
    },
    isBanBy(id: number): boolean {
      if (this.user.bannedBy) return this.user.bannedBy.includes(id);
      return false;
    },
    isInvite(id: number): boolean {
      if (this.user.invites) return this.user.invites.includes(id);
      return false;
    },
    async refuseInvite(id: number) {
      const api = mande(
        `http://localhost:3000/users/${this.user.id}/pending`,
        { credentials: "include" }
      );
      try {
        await api
          .post({
            friend: id,
            valid: false,
          })
          .then((data) => {
            
          });
      } catch (error: any) {
        this.error = error.body;
        return;
      }
      if (this.isInvite(id))
        this.user.invites = this.user.invites.filter((item) => item != id);
    },
    async acceptInvite(id: number) {
      const api = mande(
        `http://localhost:3000/users/${this.user.id}/pending`,
        { credentials: "include" }
      );
      try {
        await api
          .post({
            friend: id,
            valid: true,
          })
          .then((data) => {
            
          });
      } catch (error: any) {
        this.error = error.body;
        return;
      }
      if (this.isInvite(id))
        this.user.invites = this.user.invites.filter((item) => item != id);
      this.user.friends.push(id);
    },
    async addFriend(id: number) {
      if (id && !this.isFriends(id)) {
        if (this.isBan(id))
          if (confirm("Remove from bans before add to friends"))
            this.removeFriendOrBan(id);
          else return;
        
        const api = mande(
          "http://localhost:3000/users/friends",
          { credentials: "include" }
        );
        try {
          await api
            .post({
              friend: id,
              valid: true,
            })
            .then((data) => {
              
            });
        } catch (error: any) {
          this.error = error.body;
          return;
        }
        if (this.isInvite(id))
          this.user.invites = this.user.invites.filter((item) => item != id);
        
      }
    },
    async addBan(id: number) {
      if (id && !this.isBan(id)) {
        if (this.isFriends(id))
          if (confirm("Remove from friends before ban ?"))
            this.removeFriendOrBan(id);
          else return;
        
        const api = mande(
          "http://localhost:3000/users/ban",
          { credentials: "include" }
        );
        try {
          await api
            .post({
              banned: id,
            })
            .then((data) => {
              
            });
        } catch (error: any) {
          this.error = error.body;
          return;
        }
        this.user.bans.push(id);
      }
    },
    async removeFriendOrBan(id: number) {
      if (id && this.isFriends(id)) {
        const index = this.user.friends.indexOf(id, 0);
        if (confirm(`Remove ${id} from your friends ?`)) {
          
          const api = mande(
            "http://localhost:3000/users/friends/remove",
            { credentials: "include" }
          );
          try {
            await api
              .post({
                friend: String(id),
              })
              .then((data) => {
                this.user.friends.splice(index, 1);
              });
          } catch (error: any) {
            this.error = error.body;
            return;
          }
        }
      }
      if (id && this.isBan(id)) {
        const indexBan = this.user.bans.indexOf(id, 0);
        
        if (confirm(`Remove ${id} from your bans ?`)) {
          
          const api = mande(
            "http://localhost:3000/users/ban/remove",
            { credentials: "include" }
          );
          try {
            await api
              .post({
                ban: String(id),
              })
              .then((data) => {
                this.user.bans.splice(indexBan, 1);
              });
          } catch (error: any) {
            this.error = error.body;
            return;
          }
        }
      }
    },
  },
});
