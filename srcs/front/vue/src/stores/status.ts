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
      //console.log("setup socket condition == ", this.socket.connected)
      if (this.socket.connected) {
        //wait for sockets to be instanciated then grab current sockets and Push my instance to list of sockets

        //console.log("FETCHING ALL STATUS ==> ", this.statusList)

        this.socket.emit("findAllStatus", (res: any) => {
          res.forEach((elem: any) => {
            //console.log("ELEM IN CALLBACK == ", elem);
            //console.log("LIST IN CB == ", this.statusList)
            if (
              this.statusList.findIndex((el) => {
                return el.userId === elem.userId;
              }) == -1
            ) {
              this.statusList.push(elem);
            }
          });
        });

        //console.log("FETCHING ALL STATUS ==> ", this.statusList)
                //Change my current status for myself, emit to server i do am connected
                 this.socket.emit('connectionStatus', this.id)
             
                //Subscribe to messages from other sockets
                 this.socket.on("newStatusConnection", (res: {ISocket: ISocketStatus, ExistsAlready: boolean, sender: string}) => {
                    if (res.ExistsAlready) {
                        const index = this.statusList.findIndex((e) => {return e.userId === res.ISocket.userId})
                        this.statusList[index].socketId.push(res.sender)
                    }
                    else {
                        this.statusList.push(res.ISocket)
                    }
                 })
                 this.socket.on("newStatusDisconnection", (res: ISocketStatus) => {
                     this.statusList.splice(this.statusList.findIndex((el: ISocketStatus) => el.userId == res.userId), 1)
                 })
                 this.socket.on("newStatusChange", (res: ISocketStatus) => {
                     console.log("onChangeStatus", res)
                     const changedIndex = this.statusList.findIndex((el) => el.userId == res.userId)
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
                    if (challenge.challenged == this.id) {
                        this.challengeAccepted = true
                    }
                    else if (challenge.challenger == this.id){
                        router.push({path: "/game", query: {challenge: JSON.stringify(challenge)}})
                    }
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
      const challenge: Challenge = { challenger: id, level, challenged};
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
      this.socket.emit("challengeAccepted", this.challenge);
      let challenge: any = this.challenge;
	  console.log('ACCEPT CHALLENGE');
	  console.log(this.challenge);
      router.push({
        path: "/game",
        query: { challenge: JSON.stringify(challenge) },
      });
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
            this.challengeAccepted = false
        }
    } ,
})
