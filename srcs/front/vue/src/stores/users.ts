import { defineStore } from "pinia"
import type { IUser, IOtherUserRestrict, IOtherUser } from '../../types'
// import { mande } from 'mande'

export interface IUserStoreState {
    userList: IOtherUserRestrict[]
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
      opponentScore: 3
    },
    {
      opponent: 3,
      win: false,
      myScore: 3,
      opponentScore: 5
    }
]

// avec l'appel api je le ferai dans l'autre sens :
// recuperer tous les users en IOtherUserRestrict (pour l'affichage des friends, match history, search etc)
// si je vais sur le dashboard d'un autre user, je fais un autre fetch qui recupere les infos de IOtherUser en fonction de l'id
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
    match_history: []
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
    match_history: matchsHistory
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
    match_history: matchsHistory
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
        userList: [rogerRestrict, homerRestrict, marcRestrict],
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
        getUserHref(user:IOtherUserRestrict): string {
            return '/' + user.id
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
