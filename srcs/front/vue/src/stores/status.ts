import { defineStore } from "pinia";
import type { Challenge, ISocketStatus, TStatus } from '../../types'
import { io } from "socket.io-client"
import { useUsersStore } from "./users";
import router from "@/router";

interface IUserStatusStore {
    status: TStatus,
    invitations: Number,
    socket: any,
    statusList: ISocketStatus[],
    setuped: boolean
    error: string | null,
    challenge: Challenge,
    challengeAccepted: boolean,
    id: number
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
        id: -1
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
            console.log("el == ", socketStatus)
            const el = this.statusList.findIndex((el) => {socketStatus.userId === el.userId})
            if (el != -1) {
                console.log("TROUVE")
                this.statusList.splice(el, 1)
            }
            this.statusList.push(socketStatus)
            console.log("DANS PUSH TO LIST ", this.statusList)

        },

        connectSocket() {
            this.socket.connect()
        },

        disconnectSocket() {
            this.socket.close()
        },

        async setupSocket() {
            console.log("setup socket condition == ", this.socket.connected)
            if (this.socket.connected) {
                 //wait for sockets to be instanciated then grab current sockets and Push my instance to list of sockets

                this.socket.emit("findAllStatus", (res: any) => {console.log("res == ", res);this.statusList = res})

                 console.log("FETCHING ALL STATUS ==> ", this.statusList)

                 setTimeout(() => {
                    this.pushToList({
                        socketId: this.socket.id,
                        userStatus: 'available',
                        userId: this.id
                    })   
                 }, 1000)

                //Change my current status for myself, emit to server i do am connected
                 this.socket.emit('connectionStatus', this.id)
             
                //Subscribe to messages from other sockets
                 this.socket.on("newStatusConnection", (res: ISocketStatus) => {
                     const alreadyConnected = this.statusList.findIndex((el) => {res.userId === el.userId})
                     if (alreadyConnected != -1) {
                         this.statusList.splice(alreadyConnected, 1)
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
                 this.socket.on("challengeAccepted", (challenge: any) => {
                     router.push({path: "/game", query: {challenge: challenge}})
                 })
                 this.socket.on("refuseChallenge", () => {
                     this.challenge = null
                     this.changeCurrentUserStatus('available', this.id)
                 })
                return
            }
            else {
                setTimeout(this.setupSocket, 100)
            }
        },
        
        async setup(id: number) {
            // Check to do it only once
            if (this.setuped == false) {
                this.id = id
                this.setupSocket()        
                // console.log("my list after timeout ==> ", this.statusList)
                this.setuped = true;
            }
        },

        refuseChallenge(id: number) {
            if (this.challenge) {
                this.socket.emit('refuseChallenge', this.challenge)
                this.challenge = null;
                this.changeCurrentUserStatus('available', id)
            }
        },

        findSocket(id: Number) {
            const el =  this.statusList.find((el) => el.userId === id)
            if (el === undefined) {
                console.log("inside error")
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

        acceptChallenge() {
            this.socket.emit('challengeAccepted', this.challenge)
            let challenge: any = this.challenge
            router.push({path: "/game", query: {challenge}})
        },

        changeCurrentUserStatus(newStatus: TStatus, id: Number) {
            const el = this.findSocket(id)
            
            if (el) {
                console.log("----------- CHANGING STATUS -----------\n\n -----EL = ", el, "-----STATUS = ", newStatus)
                el.userStatus = newStatus
                this.status = newStatus;
                this.socket.emit("changeStatus", el)
            }
        },

        finishChallenge() {
            this.challenge = null,
            this.challengeAccepted = false
        }
    } ,
})
