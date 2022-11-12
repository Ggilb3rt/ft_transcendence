import { defineStore } from "pinia";
import type { Challenge, ISocketStatus, TStatus } from "../../types";
import { io } from "socket.io-client";
import { useUsersStore } from "./users";
import router from "@/router";

interface IUserStatusStore {
  status: TStatus;
  invitations: Number;
  socket: any;
  statusList: ISocketStatus[];
  setuped: boolean;
  error: string | null;
  challenge: Challenge;
  challengeAccepted: boolean;
  id: number;
}

// const usersStore = useUrsersStore()

export const useStatusStore = defineStore({
  id: "status",
  state: (): IUserStatusStore => ({
    status: "disconnected" as TStatus,
    invitations: 0 as Number,
    socket: io("http://localhost:3000/userStatus"),
    statusList: [],
    setuped: false,
    error: null,
    challenge: null,
    challengeAccepted: false,
    id: -1,
  }),

  getters: {
    getInvitations(state) {
      return state.invitations;
    },
  },

  actions: {
    socketIs(userId: number, type: TStatus): boolean {
      const findIndex = this.statusList.findIndex((el) => el.userId == userId);
      if (findIndex != -1)
        if (this.statusList[findIndex].userStatus == type) return true;
      return false;
    },
    socketIsAvailable(userId: number): boolean {
      return this.socketIs(userId, "available");
    },

    async getPending(id: Number) {
      const invitedBy = await fetch(
        `http://localhost:3000/users/${id}/pending`
      );
      if (!invitedBy) return null;
      //console.log("invitedBy = ", invitedBy, "invitedBy.json = ", invitedBy.json)
      return invitedBy.json;
    },

    pushToList(socketStatus: ISocketStatus) {
      //console.log("el == ", socketStatus)
      //console.log("liste == ", this.statusList.length)
      const el = this.statusList.findIndex((el) => {
        /*console.log(socketStatus.userId, "   ", el.userId);return  socketStatus.userId === el.userId*/
      });
      //console.log("TROUVE", el)
      if (el != -1) {
        this.statusList.splice(el, 1);
      }
      this.statusList.push(socketStatus);
      //console.log("DANS PUSH TO LIST ", this.statusList.length)
    },

    connectSocket() {
      this.socket.connect();
    },

    disconnectSocket() {
      this.socket.close();
    },

    async setupSocket() {
      if (this.socket.connected) {
                 this.socket.emit('connectionStatus', this.id)
                 this.socket.on('takeThat', ((arr:any) => {
                    arr.forEach((e: ISocketStatus) => {
                      this.statusList.push(e);
                      if (e.userId == this.id)
                        this.status = e.userStatus
                    })
                 })) 
                 this.socket.on("newStatusConnection", (res: {ISocket: ISocketStatus, ExistsAlready: boolean, sender: string}) => {
                    if (res.ExistsAlready == false) {
                        this.statusList.push(res.ISocket)
                    }
                 })
                 this.socket.on("newStatusDisconnection", (res: {ISocket: ISocketStatus, ExistsAlready: boolean, sender: string}) => {
                    console.log("res === ", res)
                    if (!res.ExistsAlready) {
                        this.statusList.splice(this.statusList.findIndex((el: ISocketStatus) => el.userId == res.ISocket.userId), 1)
                    }
                 })
                 this.socket.on("newStatusChange", (res: ISocketStatus) => {
                     const changedIndex = this.statusList.findIndex((el) => el.userId == res.userId)
                     console.log('res == ', res, "\nelem = ", this.statusList[changedIndex])
                     if (changedIndex != -1)
                       this.statusList[changedIndex].userStatus = res.userStatus
                    if (this.id == res.userId)
                      this.status = res.userStatus
                 })
             
                 //Messages for challenges
                 this.socket.on("newChallenge", (challenge: Challenge) => {
                     console.log("Challenge recu")
                     if (challenge) {
                     console.log("Challenge valide", challenge)
                         this.challenge = challenge
                     }
                 })
                 this.socket.on("challengeAccepted", (challenge: Challenge) => {
                    if (!challenge) {
                      console.log("No pending challenge")
                      return
                    }
                    const {challenger, challenged, level} = challenge
                    if (challenged == this.id) {
                        this.challengeAccepted = true
                    }
                    else if (challenger == this.id){
                      router.push({path: "/game", query: {challenge: JSON.stringify({challenger, level, challenged})}})
                    }
                 })
                 this.socket.on("refuseChallenge", () => {
                     this.challenge = null
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
                this.status = 'available'
                this.setuped = true;
            }
        },

    onClose() {
      this.socket.close();
      this.statusList = [];
    },

    refuseChallenge(id: number) {
      if (this.challenge) {
        this.socket.emit("refuseChallenge", this.challenge);
        this.challenge = null;
        this.changeCurrentUserStatus("available", id);
      }
    },

    findSocket(id: Number) {
      const el = this.statusList.find((el) => el.userId === id);
      if (el === undefined) {
        //console.log("inside error")
        this.error =
          "Failed to find current user id in statusList array store on status change";
      }
      return el;
    },

    challengeUser(id: Number, level: Number, challenged: Number) {
      const challenge: Challenge = { challenger: id, level, challenged, socketId: this.socket.id};
      const el = this.findSocket(id);
      if (el) {
        //console.log("je suis la ")
        this.socket.emit("newChallenge", challenge);
        this.challenge = challenge;
        this.changeCurrentUserStatus("challenged", id);
      } else {
        //console.log("Noooooooo")
      }
    },

    acceptChallenge() {
      const findIndex = this.statusList.findIndex(
        (el) => el.userId == Number(this.challenge?.challenger)
      );
      if (findIndex === -1) {
        alert("CHALLENGER IS NOT CONNECTED ANYMORE");
        this.changeCurrentUserStatus("available", this.id);
        return;
      } else {
        const challenger = this.statusList[findIndex];
        if (challenger.userStatus === "inGame") {
          alert("YOU TOOK TOO LONG, CHALLENEGR IS ALREADY IN A GAME");
          this.changeCurrentUserStatus("available", this.id);
          return;
        } else {
          this.socket.emit("challengeAccepted", this.challenge);
          const challenge: any = this.challenge;
          router.push({
            path: "/game",
            query: { challenge: JSON.stringify(challenge) },
          });
        }
      }
    },

    changeCurrentUserStatus(newStatus: TStatus, id: Number) {
      const el = this.findSocket(id);

      if (el) {
        //console.log("----------- CHANGING STATUS -----------\n\n -----EL = ", el, "-----STATUS = ", newStatus)
        el.userStatus = newStatus;
        this.status = newStatus;
        this.socket.emit("changeStatus", el);
      }
    },

    finishChallenge() {
      this.challengeAccepted = false;
    },
  },
});
