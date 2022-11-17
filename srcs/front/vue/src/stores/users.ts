import { defineStore } from "pinia"
import type { Ref } from "vue"
import type { IUser, IOtherUserRestrict, IOtherUser, IMatchHistory, TStatus, ISocketStatus, sideNavLink } from '../../types'
import type { io, Socket } from "socket.io-client"

export interface IUsersStoreState {
    userList: IOtherUserRestrict[]
    socketStatus: ISocketStatus[]
    user: IOtherUser | null
    loading: boolean
    error: any | null
}


const matchsHistory = [
    {
      opponent: 2,
      win: true,
      myScore: 7,
      opponentScore: 3,
      date: new Date()
    },
    {
      opponent: 3,
      win: false,
      myScore: 3,
      opponentScore: 5,
      date: new Date()
    }
]




export const useUsersStore = defineStore({
    id: "users",
    state: (): IUsersStoreState => ({
        userList: [],
        socketStatus: [],
        user: null,
        loading: false,
        error: null
    }),
    getters: {
        
        
        
        
    },
    actions: {
        isUserConnected(id: number): boolean {
            const found = this.userList.findIndex((user) => {return user.id == id})
            if (found == -1)
                return false
            return true
        },

        getUserRestrictById(id: number): IOtherUserRestrict | null {
            const finded = this.userList.filter((user) => user.id == id)
            return finded.length > 0 ? finded[0] : null
        },
        getUserNickById(id: number): string {
            const name = this.userList.find((el) => el.id == id)

            if (name)
                return name.nickname
            return ""
        },
        getUserAvatarById(id: number): string {
            const img = this.userList.find((el) => el.id == id)

            if (img)
                return img.avatar_url
            return ""
        },
        getUsersListForChat(idList: number[]): sideNavLink[] {
            let list: sideNavLink[] = []
            if (!idList)
                return list
            idList.forEach((el) => {
                const findUser = this.userList.find((user) => user.id == el)
                if (findUser != undefined) {
                    list.push({
                        name: `${findUser.nickname}`,
                        id: `/chat/room/direct/${findUser.id}`
                    })
                }
            })
            return list
        },
        changUserNick(id: number, newNick: string) {
            this.userList.some((el) => {
                if (el.id == id && el.nickname != newNick) {
                    el.nickname = newNick
                    return
                }
            })
        },
        changeUserAvatar(id: number, newAvatar: string) {
            this.userList.some((el) => {
                if (el.id == id) {
                    el.avatar_url = newAvatar
                    return
                }
            })
        },
        getUserWinRate(): number {
            let calc = 0
            if (this.user)
                calc = (this.user.wins / (this.user.loses + this.user.wins) * 100);
            return isNaN(calc) ? 0 : calc
        },
        getUserRank(): string {
            if (this.user) {
                switch (this.user?.ranking) {
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
            }
            return "Prrrrt";
        },
        async getUsers() {
            this.loading = true
            try {
                await fetch('http://localhost:3000/users/restrict', {credentials: "include"})
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            return response.json()
                          }
                          throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
                    })
                    .then((data) => {
                        this.userList = data
                        this.userList.forEach((el) => {
                            el.avatar_url = `http://localhost:3000/users/${el.id}/avatar`
                        })
                        this.error = null
                    })
            } catch (error: any) {
                this.error = error.body
            } finally {
                this.loading = false
            }
        },
        async getOtherUser(id :number) {
            this.loading = true
            const url = `http://localhost:3000/users/${id}/other`
            try {
                await fetch(url, {credentials: "include"})
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            return response.json()
                          }
                          throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
                    })
                    .then((data) => {
                        this.user = data
                        if (this.user) {
                            this.user.ranking = Math.round(this.getUserWinRate()/20)
                            this.user.avatar_url = `http://localhost:3000/users/${this.user.id}/avatar`
                            this.changUserNick(this.user.id, this.user.nickname)
                        }
                        this.error = null
                    })
            } catch (error: any) {
                this.error = error.body
                return
            } finally {
                if (this.user) {
                    if (!this.user.match_history && !this.error) {
                        //this.user.match_history = matchsHistory
                        
                        this.user.match_history = new Array()
                        if (this.user.matches) {
                            this.user.matches.forEach(el => {
                                const match : IMatchHistory = {
                                    opponent: el.player_right_id,
                                    myScore: el.score_left,
                                    opponentScore: el.score_right,
                                    win: (el.score_left > el.score_right),
                                    date: (el.date ? el.date : new Date())
                                }
                                if (this.user)
                                    this.user.match_history.push(match)
                            })
                            this.user.matches = null
                        }
                    }
                    
                }
                this.loading = false
            }
        },
    },
})
