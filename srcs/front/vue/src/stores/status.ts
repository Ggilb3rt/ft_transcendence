import { defineStore } from "pinia";
import type { Challenge, ISocketStatus, TStatus } from "../../types";
import { io, Socket } from "socket.io-client";
import { useUsersStore } from "./users";
import router from "@/router";
import type { TriggerOptions } from "@vue/test-utils/dist/createDomEvent";

interface IUserStatusStore {
  status: TStatus;
  invitations: Number;
  socket: any;
  socketGame: any;
  statusList: ISocketStatus[];
  setuped: boolean;
  error: string | null;
  challenge: Challenge;
  iChallenged: boolean;
  challengeAccepted: boolean;
  id: number;
}

// const usersStore = useUrsersStore()

export const useStatusStore = defineStore({
  id: "status",
  state: (): IUserStatusStore => ({
    status: "disconnected" as TStatus,
    invitations: 0 as number,
    //socket: io("http://localhost:3000/userStatus", {
    //  withCredentials: true,
    //}),
    socket: null,
    socketGame: io("http://localhost:3000/game", {
      query: {
        type: "storeGameSocket",
      },
    }),
    //socketGame: null,
    statusList: [],
    setuped: false,
    error: null,
    challenge: null,
    iChallenged: false,
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
      alert("CONNECT");
      //this.socketGame.connect();
    },

    disconnectSocket() {
      this.socket.close();
      this.socketGame.close();
    },

    async setupSocket() {
        console.log("je sais paaaas")

      if (this.socket.connected) {
        this.socket.emit("connectionStatus", this.id);

        this.socket.on("takeThat", (status: ISocketStatus) => {
          if (status.userId == this.id && status.userStatus == "inGame") {
            this.status = status.userStatus;
            return;
          } else if (
            status.userId == this.id &&
            status.userStatus == "challenged"
          ) {
            this.status = status.userStatus;
            return;
          } else if (!this.findSocket(status.userId))
            this.statusList.push(status);
        });

        this.socket.on(
          "newStatusConnection",
          (res: { userId: number; newClient: string }) => {
            const existsAlready = this.findSocket(res.userId);
            if (!existsAlready) {
              this.statusList.push({
                userId: res.userId,
                userStatus: "available",
              });
            }
            this.socket.emit("takeThat", {
              userId: this.id,
              userStatus: this.status,
              newClient: res.newClient,
            });
          }
        );

        this.socket.on("newStatusDisconnection", (userId: number) => {
          this.statusList.splice(
            this.statusList.findIndex(
              (el: ISocketStatus) => el.userId == userId
            ),
            1
          );
        });

        this.socket.on("newStatusChange", (res: ISocketStatus) => {
          const found = this.findSocket(res.userId);
          if (!found) return;
          found.userStatus = res.userStatus;
          if (this.id == res.userId) {
            this.status = res.userStatus;
          }
        });

        //Messages for challenges
        this.socket.on(
          "newChallenge",
          (res: { challenge: Challenge; socket: string }) => {
            console.log("Challenge recu");
            if (res.challenge && !this.challenge) {
              console.log("Challenge valide", res.challenge);
              this.challenge = res.challenge;
              this.changeCurrentUserStatus("challenged", this.id);
              this.socket.emit("challengeOk", res.socket);
            } else {
              this.socket.emit("alreadyChallenged", res.socket);
            }
          }
        );

        this.socket.on("alreadyChallenged", () => {
          this.challenge = null;
        });
        this.socket.on("challengeOk", (challenge: Challenge) => {
          this.iChallenged = true;
          console.log("I CHALLENGED = ", this.iChallenged);
          this.changeCurrentUserStatus("challenged", this.id);
        });
        this.socket.on("challengeAccepted", (challenge: Challenge) => {
          if (challenge) {
            const { challenger, challenged, level } = challenge;
            if (!this.challenge) {
              console.log("No pending challenge");
              return;
            }
            /*this.socket = io("http://localhost:3000/userStatus", {
				withCredentials: true,
			  });*/
            if (challenged == this.id) {
              this.challengeAccepted = true;
            } else if (challenger == this.id) {
              this.challengeAccepted = true;
              if (this.iChallenged == true) {
                let levelName = "";
                if (Number(level) === 0) {
                  levelName = "pong";
                  challenge.level = 1;
                } else if (Number(level) === 1) {
                  levelName = "catPong";
                  challenge.level = 3;
                } else if (Number(level) === 2) {
                  levelName = "customizable";
                  challenge.level = 2;
                }
                this.socketGame.emit("joinChallengeRoom", {
                  challenge: challenge,
                  userId: this.id,
                });
                console.log("CHALLENGE LEVEL B " + level + " " + levelName);
                this.socketGame.on("newRoomCreated", () => {
                  console.log("ROOM COMPLETE");
                  router.push({
                    path: `/game/3/${levelName}/${challenge.challengeId}`,
                  });
                });
              }
            } 
          }
        });
      }else {
        console.log("as con")
      setTimeout(this.setupSocket, 100);
    }
    },

    async setup(id: number) {
      // Check to do it only once
      if (this.setuped == false) {
        console.log("MY ID IN SETUP == ", id);
        this.socket = io("http://localhost:3000/userStatus", {
          withCredentials: true,
          query: {
            userId: id,
          },
        });
        this.id = id;
        this.setupSocket();
        this.status = "available";
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

    codeGenerator(length: number): string {
      let result = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    },

    challengeUser(id: Number, level: Number, challenged: Number) {
      console.log("je challenge un user");
      const challengeId = this.codeGenerator(5);
      const challenge: Challenge = {
        challenger: id,
        level,
        challenged,
        socketId: this.socket.id,
        challengeId,
      };
      console.log("challenge = ", challenge);
      const el = this.findSocket(challenge.challenged);
      if (el) {
        console.log("je suis la ");
        this.challenge = challenge;
        this.socket.emit("newChallenge", challenge);
      } else {
        //console.log("Noooooooo")
      }
    },

    acceptChallenge() {
      console.log("this.challenge");
      if (!this.challenge) {
        console.log("No pending challenge");
        return;
      }
      this.socket.emit("acceptChallenge", this.challenge);
      console.log("ACCEPT CHALLENGE");
      console.log(this.challenge);
      const { challenger, challenged, level, challengeId } = this.challenge;
      /*router.push({
        path: "/game",
        query: { challenge: JSON.stringify({ challenger, level, challenged }) },
      });*/
      let levelName = "";
      //console.log("CHALLENGE LEVEL A " + this.challenge.level);
      if (Number(this.challenge.level) === 0) {
        levelName = "pong";
        this.challenge.level = 1;
      } else if (Number(this.challenge.level) === 1) {
        levelName = "catPong";
        this.challenge.level = 3;
      } else if (Number(this.challenge.level) === 2) {
        levelName = "customizable";
        this.challenge.level = 2;
      }
      this.socketGame.emit("handleCreateNewChallengeRoom", {
        challenge: this.challenge,
        userId: this.id,
      });
      console.log(
        "CHALLENGE LEVEL A " + this.challenge.level + " " + levelName
      );
      //console.log("THIS CHALLENGE " + JSON.stringify(challenge) + " " + levelName);
      this.socketGame.on("newRoomCreated", () => {
        console.log("ROOM COMPLETE");
        router.push({
          path: `/game/3/${levelName}/${challengeId}`,
        });
      });

      //router.push({ path: `/game/${levelName}/${this.challenge.challengeId}` });
    },

    changeCurrentUserStatus(newStatus: TStatus, id: Number) {
      //console.log("----------- CHANGING STATUS -----------\n\n -----EL = ", el, "-----STATUS = ", newStatus)
      this.status = newStatus;
      this.socket.emit("changeStatus", {
        userId: this.id,
        userStatus: newStatus,
      });
    },

    changeChallengeForIngame(bool: boolean) {
      if (bool) {
        const challenge: Challenge = {
          challenger: -1,
          level: -1,
          challenged: -1,
          socketId: "",
          challengeId: "",
        };
        this.challenge = challenge;
      } else this.finishChallenge();

      console.log("NEW CHALLENGEeee  ");
      console.log(this.challenge);
    },

    finishChallenge() {
      this.challengeAccepted = false;
      this.challenge = null;
      this.iChallenged = false;
    },
  },
});
