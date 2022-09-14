import { defineStore } from "pinia"
import type { IUser } from '../../types'
// import { mande } from 'mande'

export interface IUserStoreState {
    userList: IUser[]
    user: IUser | null
    loading: boolean
    error: any | null
}

const roger: IUser = {
    id: 0,
    two_factor_auth: true,
    first_name: "Roger",
    last_name: "Rabbit",
    nickname: "rogerrabbit",
    avatar_url: "src/assets/avatars/rogerRabbit.png",
    ranking: 3,
    wins: 7,
    loses: 3,
};

const homer: IUser = {
    id: 1,
    two_factor_auth: false,
    first_name: "Homer",
    last_name: "Simpsons",
    nickname: "homer",
    avatar_url: "src/assets/avatars/homer.jpeg",
    ranking: 1,
    wins: 1,
    loses: 3,
};

// const api = mande('http://localhost:3000/users')

export const useUserStore = defineStore({
    id: "user",
    state: (): IUserStoreState => ({
        userList: [roger, homer],
        user: homer,
        loading: false,
        error: null
    }),
    getters: {
        getUserNick: (state) => {
            if (state.user)
                return `@${state.user.nickname}`
        },
    },
    actions: {
        changeUserNick(newTag:string) {
            if (this.user)
                this.user.nickname = newTag
        },
        getUserWinRate(user:IUser) {
            return (user.wins / user.loses).toPrecision(2)
        },
        async getUsers() {
            this.userList = []
            this.loading = true
            try {
                this.userList = await fetch('http://localhost:3000/users', {
                    method: "get",
                })
                    .then((response) => response.json())
            } catch (error) {
                this.error = error
            } finally {
                this.loading = false
            }
            // try {
            //     // const result = await api.get('/')
            //     const result = await fetch('http://localhost:3000/users')
            //     const data = await result.json()
            //     for (let i in data) {
            //         let tmp: IUser = data[i]
            //         this.userList.push(tmp)
            //     }
            // } catch (error) {
            //     console.log(error)
            //     return error
            // }
        },
    },
})
