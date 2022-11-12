import {
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

function getUser(arr: IStatus[], i: string) {
    return arr.findIndex((e) => {return e.socketId.includes(i)})
}


function countInArray(arr: IStatus[], i: number) {
    return arr.filter(item => item.userId == i).length
}

type TStatus = "available" | "disconnected" | "inGame" | "challenged"

interface IStatus {
    socketId: string[];
    userId: number;
    userStatus: TStatus;
    inGame: string | null
}

type TChallenge = {challenger: Number, level: Number, challenged: Number, socketId: string}

type TSend = {userId: number, userStatus: TStatus}

@WebSocketGateway({
	cors: {
        credentials: true,
        origin: /localhost\:[\d]*?\/?[\w]*$/
	},
    namespace: 'userStatus',
})
export class UsersStatusGateway implements OnGatewayInit, OnGatewayDisconnect {
 
    @WebSocketServer() server: Server;


    //private logger: Logger = new Logger('usersStatusGateway');
    private userArr: IStatus[] = []
    private toSend: TSend[] = []

    afterInit(server: Server) {
        //this.logger.log('Initialized')
    }


    async handleDisconnect(client: Socket) {
        const uIndex = getUser(this.userArr, client.id)
        if (uIndex == -1) {
            return
        }
        if (this.userArr[uIndex].socketId.length == 1) {
            client.broadcast.emit('newStatusDisconnection', {ISocket: this.userArr[uIndex], ExistsAlready: false, sender: client.id})
            this.userArr.splice(uIndex, 1)
            this.toSend.splice(uIndex, 1)
        } else {
            console.log("je retire mon client")
           const index = this.userArr[uIndex].socketId.findIndex((e) => {
            e === client.id;
           })
           this.userArr[uIndex].socketId.splice(index, 1)
        }
            
    }

    @SubscribeMessage('connectionStatus')
    handleConnection2(client: Socket, arg: number) {
        const index = this.userArr.findIndex((e) => {
            return e.userId == arg;
        })

        const newClients : string[] = []
        const u: IStatus = {socketId: newClients, userStatus: 'available', userId: arg, inGame: null}
        const msg: TSend = {userStatus: 'available', userId: arg}
        client.join("user_" + arg)
        if (index == -1) {
            newClients.push(client.id)
            this.userArr.push(u)
            this.toSend.push(msg)
            client.broadcast.emit('newStatusConnection', {ISocket: msg, ExistsAlready: false})
        }
        else {
            this.userArr[index].socketId.push(client.id)
        }
        console.log("MY ARR AFTER CONNECTION == ", this.userArr)
        this.server.to(client.id).emit('takeThat', this.toSend)
    }

    @SubscribeMessage('changeStatus')
    handleChangeStatus(client: Socket, arg: {userStatus: "available" | "inGame", userId: number}) {
        const index = this.userArr.findIndex((elem) => {
            return elem.userId == arg.userId
        })
        if (index == -1) {
            return
        }
        const elem = this.userArr[index];

        if (elem.inGame && client.id != elem.inGame)
            return

        if (elem.userStatus == 'challenged' && arg.userStatus != 'inGame')
            return
        if (!elem.inGame && arg.userStatus == 'inGame') {
            elem.inGame = client.id
        }

        this.userArr[index].userStatus = arg.userStatus
        this.toSend[index].userStatus = arg.userStatus

        client.broadcast.emit("newStatusChange", arg)
    }

    @SubscribeMessage('refuseChallenge')
    refuseChallenges(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.findIndex((el) => {/*console.log(el);*/ return el.userId === challenge.challenger})
        if (receiver != -1) {
            //console.log("i decline challenge from => ", receiver)
            this.userArr[receiver].userStatus = 'available'
            this.toSend[receiver].userStatus = 'available'
            this.server.to("user_" + this.userArr[receiver].userId).emit('refuseChallenge', challenge)
            const arg = this.toSend[receiver]
            console.log("arg == ", arg)
            client.emit("newStatusChange", arg)
            client.broadcast.emit("newStatusChange", {userId: challenge.challenged, userStatus: 'available'})
        }
    }

    @SubscribeMessage('newChallenge')
    newChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.findIndex((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
        //console.log("in new Challenge", this.userArr, "challenge = ",challenge, receiver)
        if (receiver != -1) {
            console.log("i challenge => ", receiver)
            this.userArr[receiver].userStatus = 'challenged' 
            this.toSend[receiver].userStatus = 'challenged'
            this.server.to("user_" + this.userArr[receiver].userId).emit('newChallenge', challenge)
            const arg = this.toSend[receiver]
            console.log("arg == ", arg)
            client.broadcast.emit("newStatusChange", arg)
        }
    }

    @SubscribeMessage('challengeAccepted')
    acceptChallenge(client: Socket, challenge: TChallenge) {
        const sender = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        const receiver = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        if (receiver) {
            //console.log("i accept challenge from => ", receiver)
            this.server.to("user_" + sender.userId).emit('challengeAccepted', challenge)
            this.server.to("user_" + receiver.userId).emit('challengeAccepted', challenge)
        }
    }
//
    // @SubscribeMessage('chatToServer')
    // handleMessage(client: any, payload: { sender: string, room: string, payload: string }) {
    //     // Le to() permet d'emit a une room specifique et non pas a tout le namespace
    //     this.server.to(payload.room).emit('chatToClient', payload);
    // }

    // @SubscribeMessage('joinRoom')
    // handleJoinRoom(client: Socket, room: string) {
    //     client.join(room);
    //     //Only to this specific client
    //     client.emit('joinedRoom', room);
    // }

    // @SubscribeMessage('leaveRoom')
    // handleLeaveRoom(client: Socket, room: string) {
    //     client.leave(room);
    //     client.emit('leftRoom', room);
    // }

}
