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
    friends: [1],
    blocks: [3, 5, 6, 7]
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
    friends: [0, 1, 2, 3, 4],
    blocks: [3, 2]
};

// const api = mande('http://localhost:3000/users')

export const useUsersStore = defineStore({
    id: "users",
    state: (): IUserStoreState => ({
        userList: [roger, homer],
        user: homer,
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
        },
    },
})
