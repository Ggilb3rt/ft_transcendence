import { defineStore } from "pinia";
import type { Challenge, ISocketStatus, IUser, status } from '../../types'
import { io } from "socket.io-client"

// const user = useUserStore().user

interface IUserStatusStore {
    status: status,
    invitations: Number,
    socket: any,
    statusList: ISocketStatus[],
    setuped: boolean
    // user: IUser,
    error: string | null,
    challenge: Challenge,
    alreadyChallenged: boolean,
    challengeAccepted: boolean,
}

export const useStatusStore = defineStore({
    id: "status",
    state: (): IUserStatusStore => ({
        status: 'disconnected' as status,
        invitations: 0 as Number,
        socket: io("http://localhost:3000/userStatus"),
        statusList: [],
        setuped: false,
        // user,
        error: null,
        challenge: null,
        alreadyChallenged: false,
        challengeAccepted: false,
    }),

    getters: {
        getInvitations(state) {
            return (state.invitations)
        }
    },
    
    actions: {
        socketIs(userId: number, type: status): boolean {
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
                    }
                )

                //Messages for challenges
                this.socket.on("newChallenge", (challenge: Challenge) => {
                    if (this.challenge != null) {
                        this.socket.emit('alreadyChallenged')   
                    }
                    else {
                        this.challenge = challenge
                    }
                })
                this.socket.on("challengeAccepted", (arg: ISocketStatus) => {
                    this.challengeAccepted = true;
                })

                this.socket.on("alreadyChallenged", (id: Number) => {
                    this.alreadyChallenged = true;
                })
                this.setuped = true;
            }
        } ,

        closeAlreadyChallenged() {
            this.alreadyChallenged = false
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
                this.socket.emit("newChallenge", challenge)
            }
        },

        changeCurrentUserStatus(newStatus: status, id: Number) {
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