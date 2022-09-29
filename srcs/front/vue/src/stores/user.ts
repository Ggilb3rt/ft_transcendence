import { defineStore } from "pinia"
import type { IUser } from '../../types'
// import { mande } from 'mande'

export interface IUserStoreState {
    user: IUser
    loading: boolean
    error: any | null
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
        getWinRate: (state) => {
            return (state.user.wins / state.user.loses).toPrecision(2)
        }
    },
    actions: {
        getUserNick(): string {
            return `@${this.user.nickname}`
        },
        setUserNick(newTag:string) {
            if (this.user)
                this.user.nickname = newTag
        },
        getUserAvatar() {
            if (this.user.avatar_url)
                return `/${this.user.avatar_url}`
        },
        setUserAvatar(url:string) {
            if (this.user)
                this.user.avatar_url = url
        },
        addFriend(id: number) {
            if (id && (this.user.friends.find(el => el == id) == undefined)) {
                this.user.friends.push(id)
            }
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
                const user = await fetch(`http://localhost:3000/users/${id}`, {
                    method: "get",
                })
                    .then((response) => response.json())
                console.log(user)
                this.user = user
            } catch (error: any) {
                this.error = error
                console.log('getUser error : ' + this.error)
            } finally {
                if (!this.user.nickname)
                    this.user.nickname = 'Stanley'
                if (!this.user.avatar_url)
                    this.user.avatar_url = "src/assets/avatars/default.jpg"
                if (!this.user.wins)
                    this.user.wins = 5
                if (!this.user.loses)
                    this.user.loses = 1
                if (!this.user.ranking)
                    this.user.ranking = Math.round(this.user.wins / this.user.loses)
                if (!this.user.friends)
                    this.user.friends = [1, 2, 3, 5]
                if (!this.user.blocks)
                    this.user.blocks = [0, 10, 23, 45, 7, 2]
                if (!this.user.invites)
                    this.user.invites = [4, 1]
                if (!this.user.match_history)
                    this.user.match_history = matchsHistory
                this.loading = false
                this.connected = true
            }
        },
    },
})
