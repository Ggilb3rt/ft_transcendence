import { defineStore } from "pinia"
import type { Ref } from "vue"
import type { IUser, IOtherUserRestrict, IOtherUser, IMatchHistory, status, ISocketStatus } from '../../types'
import type { io, Socket } from "socket.io-client"
// import { mande } from 'mande'

export interface IUserStoreState {
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

// avec l'appel api je le ferai dans l'autre sens :
// recuperer tous les users en IOtherUserRestrict (pour l'affichage des friends, match history, search etc)
// si je vais sur le dashboard d'un autre user, je fais un autre fetch qui recupere les infos de IOtherUser en fonction de l'id

// dans un soucis d'optimisation on pourrai uniquement remplir UsersList avec les users dont le user principal connait les relations
// sinon cf virtualList from VueUse

const roger: IOtherUser = {
    id: 1,
    first_name: "Roger",
    last_name: "Rabbit",
    nickname: "rogerrabbit",
    avatar_url: "src/assets/avatars/rogerRabbit.png",
    ranking: 3,
    wins: 7,
    loses: 3,
    friends: [1],
    match_history: [],
    match_match_player_left_idTousers: null,
    match_match_player_right_idTousers: null
};
const rogerRestrict: IOtherUserRestrict = {
    id: roger.id,
    nickname: roger.nickname,
    avatar_url: roger.avatar_url
}

const homer: IOtherUser = {
    id: 2,
    first_name: "Homer",
    last_name: "Simpsons",
    nickname: "homer",
    avatar_url: "src/assets/avatars/homer.jpeg",
    ranking: 1,
    wins: 1,
    loses: 3,
    friends: [0, 1, 2, 3, 4],
    match_history: matchsHistory,
    match_match_player_left_idTousers: null,
    match_match_player_right_idTousers: null
};
const homerRestrict: IOtherUserRestrict = {
    id: homer.id,
    nickname: homer.nickname,
    avatar_url: homer.avatar_url
}

const marc: IOtherUser = {
    id: 4,
    first_name: "oh",
    last_name: "hi",
    nickname: "Mark",
    avatar_url: "src/assets/avatars/mark.jpg",
    ranking: 1,
    wins: 1,
    loses: 3,
    friends: [0, 1, 2, 3, 4],
    match_history: matchsHistory,
    match_match_player_left_idTousers: null,
    match_match_player_right_idTousers: null
};
const marcRestrict: IOtherUserRestrict = {
    id: marc.id,
    nickname: marc.nickname,
    avatar_url: marc.avatar_url
}


// fin data qui doit etre fetch


// const api = mande('http://localhost:3000/users')

export const useUsersStore = defineStore({
    id: "users",
    state: (): IUserStoreState => ({
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
        setSocket(socket: ISocketStatus[]) {    // change the name
            this.socketStatus = socket
            console.log("socket in store", this.socketStatus)
        },
        socketIsAvailable(userId: number): boolean {
            const findIndex = this.socketStatus.findIndex((el) => el.userId == userId)
            if (findIndex != -1)
                if (this.socketStatus[findIndex].userStatus == "available")
                    return true
            return false
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
        changUserNick(id: number, newNick: string) {
            this.userList.some((el) => {
                if (el.id == id) {
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
                await fetch('http://localhost:3000/users/restrict')
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            return response.json()
                          }
                          throw new Error(response.statusText)
                    })
                    .then((data) => {
                        this.userList = data
                        this.userList.forEach((el) => {
                            el.avatar_url = `http://localhost:3000/users/${el.id}/avatar`
                        })
                        this.error = null
                    })
            } catch (error) {
                this.error = error
            } finally {
                this.loading = false
            }
        },
        async getOtherUser(id :number) {
            this.loading = true
            const url = `http://localhost:3000/users/${id}/other`
            try {
                await fetch(url)
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            return response.json()
                          }
                          throw new Error(response.statusText)
                    })
                    .then((data) => {
                        this.user = data
                        this.user.avatar_url = `http://localhost:3000/users/${this.user.id}/avatar`
                        this.error = null
                    })
            } catch (error: any) {
                this.error = error
                return
            } finally {
                if (!this.user.match_history && !this.error) {
                    // this.user.match_history = matchsHistory
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
                }
                this.loading = false
            }
        },
    },
})
