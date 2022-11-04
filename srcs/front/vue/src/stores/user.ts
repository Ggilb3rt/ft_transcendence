import { defineStore } from "pinia"
import type { IMatchHistory, IUser } from '../../types'
import { mande, defaults } from 'mande'

defaults.credentials = "include"

export enum setStatus {
    connected = 0,
    need2fa,
    needLogin,
  }

export type constatus = setStatus.connected | setStatus.need2fa | setStatus.needLogin

export interface IUserStoreState {
    user: IUser
    loading: boolean
    error: any | null
    connected: boolean
    twoFactorAuth: boolean
    conStatus: constatus
}

export const useUserStore = defineStore({
    id: "user",
    state: (): IUserStoreState => ({
        user: {} as IUser,
        loading: false,
        error: null,
        connected: false,
        twoFactorAuth: false,
        conStatus: setStatus.needLogin, 
    }),
    getters: {
        // getUserNick: (state) => {
        //     if (state.user)
        //         return `@${state.user.nickname}`
        // },
        getWinRate: (state): string => {
            return (state.user.wins / state.user.loses).toPrecision(2)
        },
        getUserRank: (state): string => {
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
        },
    },
    actions: {
        // getters and setters
        getUserNick(): string {
            return `${this.user.nickname}`
        },
        getFriendsList(): number[] {
            return this.user.friends
        },
        setUserNick(newTag:string) {
            if (this.user)
                this.user.nickname = newTag
        },
        set2FAConnect(value: boolean) {
            console.log("in store set connection 2FA to ", value)
            this.twoFactorAuth = value
        },
        change2FA() {
            console.log("in store change user 2FA")
            this.user.two_factor_auth = !this.user.two_factor_auth
        },
        getStatus(): constatus {
            return this.conStatus
        },
        changeStatus(status: constatus) {
            this.conStatus = status
        },
        async getUser(id: number) {
            this.loading = true
            try {
                await fetch(`http://localhost:3000/users/${id}`, {credentials: "include"})
                    .then((response) => {
                        if (response.status >= 200 && response.status < 300) {
                            return response.json()
                          }
                          throw new Error(response.statusText)
                    })
                    .then((data) => {
                        if (data) {
                            // this.user.bans = this.user.bans
                            this.user = data
                            this.user.avatar_url = `http://localhost:3000/users/${this.user.id}/avatar`
                            this.error = null
                            this.connected = true
                        }
                    })
            } catch (error: any) {
                this.error = error.body
            } finally {
                    // console.log(user)
                // if (!this.user.invites && !this.error)
                //     this.user.invites = [4, 1]
                if (!this.user.match_history && !this.error) {
                    this.user.match_history = new Array()
                    if (this.user.matches) {
                        this.user.matches.forEach(el => {
                            const match : IMatchHistory = {
                                opponent: el.player_right_id,
                                myScore: el.score_left,
                                opponentScore: el.score_right,
                                win: (el.score_left > el.score_right),
                                date: new Date()
                            }
                            this.user.match_history.push(match)
                        })
                        this.user.matches = null
                    }
                }
                this.loading = false
            }
        },

        // Manage Friends and Bans
        isFriends(id: number): boolean {
            if (this.user.friends)
                return this.user.friends.includes(id)
            return false
        },
        isBan(id: number): boolean {
            if (this.user.bans)
                return this.user.bans.includes(id)
            return false
        },
        isBanBy(id: number): boolean {
            if (this.user.bannedBy)
                return this.user.bannedBy.includes(id)
            return false
        },
        isInvite(id: number): boolean {
            console.log("is in invite list", id)
            if (this.user.invites)
                return this.user.invites.includes(id)
            return false
        },
        async refuseInvite(id: number) {
            const api = mande('http://localhost:3000/users/'+this.user.id+'/friends', {credentials: "include"})
                try {
                    await api.post({
                        friend: id,
                        valid: false
                    })
                    .then((data) => {
                        console.log('data refuse friend invite', data)
                    })
                } catch (error: any) {
                    console.log('refuse friend invite err ', error.message)
                    this.error = error.body
                    return
                }
                if (this.isInvite(id))
                    this.user.invites = this.user.invites.filter(item => item != id)
        },
        async addFriend(id: number) {
            if (id && !(this.isFriends(id))) {
                if (this.isBan(id))
                    if (confirm("Remove from bans before add to friends"))
                        this.removeFriendOrBan(id)
                    else
                        return
                // send info to back and wait for res
                const api = mande('http://localhost:3000/users/'+this.user.id+'/friends', {credentials: "include"})
                try {
                    await api.post({
                        friend: id,
                        valid: true
                    })
                    .then((data) => {
                        console.log('data add friend', data)
                    })
                } catch (error: any) {
                    console.log('add friend err ', error.message)
                    this.error = error.body
                    return
                }
                if (this.isInvite(id))
                    this.user.invites = this.user.invites.filter(item => item != id)
                this.user.friends.push(id)
            }
        },
        async addBan(id: number) {
            if (id && !(this.isBan(id))) {
                if (this.isFriends(id))
                    if (confirm("Remove from friends before ban ?"))
                        this.removeFriendOrBan(id)
                    else
                        return
                // send info to back and wait for res
                const api = mande('http://localhost:3000/users/'+this.user.id+'/ban', {credentials: "include"})
                try {
                    await api.post({
                        banned: id
                    })
                    .then((data) => {
                        console.log('data ban', data)
                    })
                } catch (error: any) {
                    console.log('ban err ', error)
                    this.error = error.body
                    return
                }
                this.user.bans.push(id)
            }
        },
        async removeFriendOrBan(id: number) {
            if (id && this.isFriends(id)) {
                const index = this.user.friends.indexOf(id, 0)
                if(confirm(`Remove ${id} from your friends ?`)) {
                    // send info to back and wait for res
                    const api = mande('http://localhost:3000/users/'+this.user.id+'/friends/remove', {credentials: "include"})
                    try {
                        await api.post({
                            friend: String(id)
                        })
                        .then((data) => {
                            console.log('remove friend ', data)
                            this.user.friends.splice(index, 1)
                        })
                    } catch (error: any) {
                        console.log('remove friend err ', error)
                        this.error = error.body
                        return
                    }
                }
            }
            if (id && this.isBan(id)) {
                const indexBan = this.user.bans.indexOf(id, 0)
                // const indexOtherFriend = 
                if(confirm(`Remove ${id} from your bans ?`)) {
                    // send info to back and wait for res
                    const api = mande('http://localhost:3000/users/'+this.user.id+'/ban/remove', {credentials: "include"})
                    try {
                        await api.post({
                            ban: String(id)
                        })
                        .then((data) => {
                            console.log('remove ban', data)
                            this.user.bans.splice(indexBan, 1)
                        })
                    } catch (error: any) {
                        console.log('remove ban err ', error)
                        this.error = error.body
                        return
                    }
                }
            }
        }
    },
})
