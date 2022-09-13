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
    isAdmin: true,
    name: "Roger Rabbit",
    tag: "rogerrabbit",
    img: "src/assets/avatars/rogerRabbit.png",
    level: 3,
    nbWin: 7,
    nbLoose: 3,
};

const homer: IUser = {
    id: 1,
    isAdmin: false,
    name: "Homer",
    tag: "homer",
    img: "src/assets/avatars/homer.jpeg",
    level: 1,
    nbWin: 1,
    nbLoose: 3,
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
        getUserTag: (state) => {
            if (state.user)
                return `@${state.user.tag}`
        },
    },
    actions: {
        changeUserTag(newTag:string) {
            if (this.user)
                this.user.tag = newTag
        },
        getUserWinRate(user:IUser) {
            return (user.nbWin / user.nbLoose).toPrecision(2)
        },
        async getUsers() {
            this.userList = []
            this.loading = true
            try {
                this.userList = await fetch('http://localhost:3000/users')
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
