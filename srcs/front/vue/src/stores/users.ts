import { defineStore } from "pinia"
import type { Ref } from "vue"
import type { IUser, IOtherUserRestrict, IOtherUser, IMatchHistory, TStatus, ISocketStatus } from '../../types'
import type { io, Socket } from "socket.io-client"

export interface IUsersStoreState {
    userList: IOtherUserRestrict[]
    socketStatus: ISocketStatus[]
    user: IOtherUser | null
    loading: boolean
    error: any | null
}

// Datas to fetch from api
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

// dans un soucis d'optimisation on pourrai uniquement remplir UsersList avec les users dont le user principal connait les relations
// sinon cf virtualList from VueUse

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
        // getUserNick: (state) => {
        //     if (state.user)
        //         return `@${state.user.nickname}`
        // },
        getUserRank: (state): string => {
            if (state.user) {
                switch (state.user.ranking) {
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
            }
            return ("Prrrrt")
        },

    },
    actions: {
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
        // getUserStatus(id: number): status {
        //     let ret: ISocketStatus | undefined = undefined;
            
        //     console.log("start socketStatus", this.socketStatus)
        //     if (this.socketStatus) {
        //         this.socketStatus.forEach((el: any) => {
        //             console.log(`mon tableau de fou \n\t${el.userId[0]}\n\t${el.userStatus}`)
        //         })
        //         ret = this.socketStatus.includes((el: any) => {
        //             el.userId[0] == id;
        //             console.log("ref el", el)
        //         })
        //     }
        //     console.log("return of socketStatus", ret)
        //     if (ret == undefined)
        //         return 'disconnected'
        //     console.log("get userStatus ", ret)
        //     return ret.userStatus
        // },
        
        // je devrai plutot return string[] et adapter si besoin dans les composents
        getUsersListForChat(idList: number[]): Object[] | null {
            let list: Object[] = []
            if (!idList)
                return null
            idList.forEach((el) => {
                const findUser = this.userList.find((user) => user.id == el)
                if (findUser != undefined) {
                    list.push({
                        name: `${findUser.nickname}`,
                        id `/chat/room/direct/${findUser.id}`
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
        getUserWinRate(): string {
            if (this.user)
                return (this.user.wins / this.user.loses).toPrecision(2)
            return '0'
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
                    // this.error = null
                }
                this.loading = false
            }
        },
    },
})