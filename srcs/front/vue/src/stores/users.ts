import { defineStore } from "pinia"
import type { IUser } from '../../types'

export interface IUserStoreState {
    userList: IUser[]
    user: IUser | null
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


export const useUserStore = defineStore({
    id: "user",
    state: (): IUserStoreState => ({
        userList: [roger, homer],
        user: homer
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
        }
    },
})
