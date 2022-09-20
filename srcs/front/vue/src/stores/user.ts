import { defineStore } from "pinia"
import type { IUser } from '../../types'
// import { mande } from 'mande'

export interface IUserStoreState {
    user: IUser | null
    loading: boolean
    error: any | null
}

// const api = mande('http://localhost:3000/users')


export const useUserStore = defineStore({
    id: "user",
    state: () => ({
        neededId: 1 as Number,
        user: null as IUser | null,
        loading: false,
        error: null
    }),
    getters: {
        // getUserNick: (state) => {
        //     if (state.user)
        //         return `@${state.user.nickname}`
        // },
    },
    actions: {
        getUserNick(user:IUser): string {
            return `@${user.nickname}`
        },
        changeUserNick(newTag:string) {
            if (this.user)
                this.user.nickname = newTag
        },
        getUserWinRate(user:IUser) {
            return (user.wins / user.loses).toPrecision(2)
        },
        getUserLevel(user:IUser): string {
            switch (user.ranking) {
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
            } finally {
                this.loading = false
            }
        },
    },
})
