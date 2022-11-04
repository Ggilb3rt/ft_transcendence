import { defineStore } from "pinia";
import type { Challenge, ISocketStatus, TStatus } from '../../types'
import { io } from "socket.io-client"
import { useUsersStore } from "./users";

interface IUserStatusStore {
    status: TStatus,
    invitations: Number,
    socket: any,
    statusList: ISocketStatus[],
    setuped: boolean
    error: string | null,
    challenge: Challenge,
    challengeAccepted: boolean,
}

// const usersStore = useUrsersStore()

export const useStatusStore = defineStore({
    id: "status",
    state: (): IUserStatusStore => ({
        status: 'disconnected' as TStatus,
        invitations: 0 as Number,
        socket: io("http://localhost:3000/userStatus"),
        statusList: [],
        setuped: false,
        error: null,
        challenge: null,
        challengeAccepted: false,
    }),

    getters: {
        getInvitations(state) {
            return (state.invitations)
        }
    },
    
    actions: {
        socketIs(userId: number, type: TStatus): boolean {
            const findIndex = this.statusList.findIndex((el) => el.userId == userId)
            if (findIndex != -1)
                if (this.statusList[findIndex].userStatus == type)
                    return true
            return false
        },
        socketIsAvailable(userId: number): boolean {
            return this.socketIs(userId, "available")
        },


        async getPending(id: Number) {
            const invitedBy= await fetch(`http://localhost:3000/users/${id}/pending`);
            if (!invitedBy)
                return null
            console.log("invitedBy = ", invitedBy, "invitedBy.json = ", invitedBy.json)
            return invitedBy.json
        } ,

        pushToList(socketStatus: ISocketStatus) {
            this.statusList.push(socketStatus)
        },

        connectSocket() {
            this.socket.connect()
        },

        disconnectSocket() {
            this.socket.close()
        },
        
        async setup(id: number) {
            // Check to do it only once
            if (this.setuped == false) {
                this.socket.emit("findAllStatus", (res: any) => {this.statusList = res})
                //Push my instance to list of sockets
                const toto = this.socket.emit('findAllStatus')
                console.log("toto = ", toto, "\n\ntypeof toto = ", typeof toto)
                this.pushToList({
                    socketId: this.socket.id,
                    userId: id,
                    userStatus: 'available'
                })

                //Change my current status for myself, emit to server i do am connected
                this.changeCurrentUserStatus('available', id)
                this.socket.emit('connectionStatus', id)
                //Subscribe to messages from other sockets

                // Messages for userStatus
                this.socket.on("newStatusConnection", (res: ISocketStatus) => {
                    const alreadyConnected = this.statusList.findIndex((el) => {res.userId === el.userId})
                    if (alreadyConnected != -1) {
                        this.statusList.slice(alreadyConnected, 1)
                    }
                    this.statusList.push(res)
                })
                this.socket.on("newStatusDisconnection", (res: ISocketStatus) => {
                    this.statusList.splice(this.statusList.findIndex((el: ISocketStatus) => el.socketId == res.socketId), 1)
                })
                this.socket.on("newStatusChange", (res: ISocketStatus) => {
                    console.log("onChangeStatus", res)
                    const changedIndex = this.statusList.findIndex((el) => el.socketId == res.socketId)
                    if (changedIndex != -1)
                      this.statusList[changedIndex].userStatus = res.userStatus
                })

                //Messages for challenges
                this.socket.on("newChallenge", (challenge: Challenge) => {
                    console.log("Challenge recu")
                    if (challenge) {
                    console.log("Challenge valide", challenge)
                        this.challenge = challenge
                        this.changeCurrentUserStatus('challenged', challenge.challenged)
                    }
                })
                this.socket.on("challengeAccepted", (arg: ISocketStatus) => {
                    this.challengeAccepted = true;
                })
                this.socket.on("refuseChallenge", () => {
                    this.challenge = null
                })
                this.setuped = true;
            }
        },

        refuseChallenge() {
            if (this.challenge) {
                this.socket.emit('refuseChallenge', this.challenge)
                this.challenge = null
            }
        },

        findSocket(id: Number) {
            const el =  this.statusList.find((el) => el.userId === id)
            if (el === undefined) {
                this.error = "Failed to find current user id in statusList array store on status change";
            }
            return el
        },

        challengeUser(id: Number, level: Number, challenged: Number) {
            const challenge: Challenge = {challenger: id, level, challenged}
            const el = this.findSocket(id)
            if (el) {
                console.log("je suis la ")
                this.socket.emit("newChallenge", challenge)
                this.challenge = challenge
                this.changeCurrentUserStatus('challenged', id)
            }
            else {
                console.log("Noooooooo")
            }
        },

        changeCurrentUserStatus(newStatus: TStatus, id: Number) {
            const el = this.findSocket(id)
            
            if (el) {
                console.log("----------- CHANGING STATUS -----------\n\n -----EL = ", el, "-----STATUS = ", newStatus)
                el.userStatus = newStatus
                this.status = newStatus;
                this.socket.emit("changeStatus", el)
            }
        }
    } ,
})