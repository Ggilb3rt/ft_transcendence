import { defineStore } from "pinia"
import type { IMatchHistory, IUser, IMatch } from '../../types'
// import { mande } from 'mande'

export interface IUserStoreState {
    user: IUser
    loading: boolean
    error: Error | null
    connected: boolean
}

// const api = mande('http://localhost:3000/users')


// Match history to change with api call
const matchsHistory = [
    {
      opponent: 2,
      win: true,
      myScore: 7,
      opponentScore: 3
    },
    {
      opponent: 1,
      win: false,
      myScore: 3,
      opponentScore: 5
    },
    {
      opponent: 1,
      win: false,
      myScore: 1,
      opponentScore: 7
    },
    {
      opponent: 4,
      win: true,
      myScore: 7,
      opponentScore: 0
    },
    {
      opponent: 2,
      win: false,
      myScore: 2,
      opponentScore: 7
    }
  ]




export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        neededId: 1 as Number,
        user: {} as IUser,
        loading: false,
        error: null,
        connected: false
    }),
    getters: {
        // getUserNick: (state) => {
        //     if (state.user)
        //         return `@${state.user.nickname}`
        // },
        getWinRate: (state): string => {
            return (state.user.wins / state.user.loses).toPrecision(2)
        },
    },
    actions: {
        // getters and setters
        getUserNick(): string {
            return `@${this.user.nickname}`
        },
        setUserNick(newTag:string) {
            if (this.user)
                this.user.nickname = newTag
        },
        getUserAvatar() {
            if (this.user.avatar_url)
                return `${this.user.avatar_url}`
        },
        setUserAvatar(url:string) {
            if (this.user)
                this.user.avatar_url = url
        },
        getUserLevel(): string {
            switch (this.user.ranking) {
                case 0:
                    return ("Pipou")
                    break
                case 1:
                    return ("Adept")
                    break
                case 2:
                    return ("Pongger")
                    break
                case 3:
                    return ("Your body is ready")
                    break
                case 4:
                    return ("Master")
                    break
                case 5:
                    return ("God")
                    break
                default:
                    return ("Prrrrt")
                    break
            }
        },
        async getUser(id: number) {
            this.loading = true
            try {
                await fetch(`http://localhost:3000/users/${id}`)
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            return response.json()
                          }
                          throw new Error(response.statusText)
                    })
                    .then((data) => {
                        if (data) {
                            this.user.ban_users_ban_users_idTousers = this.user.ban_users_ban_users_idTousers
                            this.user = data
                            this.error = null
                            this.connected = true
                        }
                    })
            } catch (error: any) {
                this.error = error
            } finally {
                    // console.log(user)
                    // this.user = user
                    // if (!this.user.id)
                //     this.user.id = 0
                // if (!this.user.first_name)
                //     this.user.first_name = 'Stanley'
                // if (!this.user.nickname)
                //     this.user.nickname = 'stan'
                // if (!this.user.avatar_url)
                //     this.user.avatar_url = "src/assets/avatars/default.jpg"
                // if (!this.user.wins)
                //     this.user.wins = 5
                // if (!this.user.loses)
                //     this.user.loses = 1
                // if (!this.user.ranking)
                //     this.user.ranking = Math.round(this.user.wins / this.user.loses)
                // if (!this.user.friends)
                //     this.user.friends = [1, 2, 3, 5]
                // if (!this.user.ban_users_ban_users_idTousers)
                //     this.user.ban_users_ban_users_idTousers = [0, 11, 22, 45, 7, 2]
                if (!this.user.invites && !this.error)
                    this.user.invites = [4, 1]
                if (!this.user.match_history && !this.error) {
                    //this.user.match_history = matchsHistory
                    
                    this.user.match_history = new Array()
                    if (this.user.match_match_player_left_idTousers) {
                        this.user.match_match_player_left_idTousers.forEach(el => {
                            const match : IMatchHistory = {
                                opponent: el.player_right_id,
                                myScore: el.score_left,
                                opponentScore: el.score_right,
                                win: (el.score_left > el.score_right),
                                date: new Date()
                            }
                            this.user.match_history.push(match)
                        })
                        this.user.match_match_player_left_idTousers = null
                    }
                    if (this.user.match_match_player_right_idTousers) {
                        this.user.match_match_player_right_idTousers.forEach(el => {
                            const match : IMatchHistory = {
                                opponent: el.player_left_id,
                                myScore: el.score_right,
                                opponentScore: el.score_left,
                                win: (el.score_right > el.score_left),
                                date: new Date()
                            }
                            this.user.match_history.push(match)
                        })
                        this.user.match_match_player_right_idTousers = null
                    }
                    
                    // this.user.match_history = this.createMatch_history(this.user.match_match_player_left_idTousers, this.user.match_match_player_right_idTousers)
                    // this.user.match_match_player_left_idTousers = null
                    // this.user.match_match_player_right_idTousers = null
                    // need to sort the match history array by date

                }
                this.loading = false
            }
        },

        //!!! need to make it async but don't want to return promise...
        createMatch_history(leftMatchs: IMatch[] | null, rightMatchs: IMatch[] | null): IMatchHistory[] {
            let matchs: IMatchHistory[] = new Array()

            if (leftMatchs) {
                leftMatchs.forEach(el => {
                    const match : IMatchHistory = {
                        opponent: el.player_right_id,
                        myScore: el.score_left,
                        opponentScore: el.score_right,
                        win: (el.score_left > el.score_right),
                        date: new Date()
                    }
                    this.user.match_history.push(match)
                })
                // leftMatchs = null
            }
            if (rightMatchs) {
                rightMatchs.forEach(el => {
                    const match : IMatchHistory = {
                        opponent: el.player_left_id,
                        myScore: el.score_right,
                        opponentScore: el.score_left,
                        win: (el.score_right > el.score_left),
                        date: new Date()
                    }
                    this.user.match_history.push(match)
                })
                // rightMatchs = null
            }
            return matchs
        },

        // Manage Friends and Bans
        isFriends(id: number): boolean {
            if (this.user.friends)
                return this.user.friends.includes(id)
            return false
        },
        isBan(id: number): boolean {
            if (this.user.ban_users_ban_users_idTousers)
                return this.user.ban_users_ban_users_idTousers.includes(id)
            return false
        },
        isInvite(id: number): boolean {
            console.log("is in invite list", id)
            if (this.user.invites)
                return this.user.invites.includes(id)
            return false
        },
        async addFriend(id: number) {
            if (id && !(this.isFriends(id))) {
                if (this.isBan(id))
                    if (confirm("Remove from bans before add to friends"))
                        this.removeFriendOrBan(id)
                    else
                        return
                // send info to back and wait for res
                if (this.isInvite(id))
                    this.user.invites = this.user.invites.filter(item => item != id)
                this.user.friends.push(id)
            }
        },
        async addBan(id: number) {
            if (id && !(this.isBan(id))) {
                if (this.isFriends(id))
                    if (confirm("Remove from friends before ban ?"))
                        this.removeFriendOrBan(id)
                    else
                        return
                // send info to back and wait for res
                this.user.ban_users_ban_users_idTousers.push(id)
            }
        },
        async removeFriendOrBan(id: number) {
            if (id && this.isFriends(id)) {
                const index = this.user.friends.indexOf(id, 0)
                if(confirm(`Remove ${id} from your friends ?`)) {
                    // send info to back and wait for res
                    this.user.friends.splice(index, 1)
                }
            }
            if (id && this.isBan(id)) {
                const index = this.user.ban_users_ban_users_idTousers.indexOf(id, 0)
                if(confirm(`Remove ${id} from your bans ?`)) {
                    // send info to back and wait for res
                    this.user.ban_users_ban_users_idTousers.splice(index, 1)
                }
            }
        }
    },
})
