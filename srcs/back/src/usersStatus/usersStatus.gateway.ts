import {
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import cluster from 'cluster';


type TStatus = "available" | "disconnected" | "inGame"
interface IStatus {
    socketId: string;
    userId: number;
    userStatus: TStatus;
}

type TChallenge = {challenger: Number, level: Number, challenged: Number}

@WebSocketGateway({
	cors: {
		origin: '*'
	},
    namespace: 'userStatus',
})
export class UsersStatusGateway implements OnGatewayInit, OnGatewayDisconnect {
 
    @WebSocketServer() server: Server;


    private logger: Logger = new Logger('usersStatusGateway');
    private userArr: IStatus[] = []

    afterInit(server: Server) {
        this.logger.log('Initialized')
    }


    async handleDisconnect(client: Socket) {
        this.logger.log(`client disconnect : ${client.id}`)
        let uIndex = this.userArr.findIndex(el => el.socketId == client.id)
        
        if (uIndex != -1) {
            client.broadcast.emit('newStatusDisconnection', this.userArr[uIndex])
            this.userArr.splice(uIndex, 1)
            console.log("this.user.arr after splice = ", this.userArr)
        }
    }

    // async handleConnection(client: Socket, ...args: any[]) {
    //     console.log("HandleConnection2");
    //     const sockets = await this.server.fetchSockets()
    //     sockets.forEach(element => {
    //         console.log("id == ", element.id)
    //     });
    //     const u: IStatus = {socketId: client.id, userStatus: "available", userId: arg}
    //     this.userArr.push(u)
    //     this.logger.log(`client connection : ${client.id}`)
    //     // nsp.emit('newStatusConnection', u)
    //     this.server.emit('newStatusConnection', u)
    //     return this.userArr
    // }


    @SubscribeMessage('connectionStatus')
    async handleConnection2(client: Socket, arg: number) {
        const alreadyConnected = this.userArr.findIndex((el) => {console.log("el ==== ", el, "id ==== ", arg); return el.userId === arg})
        console.log("handleConnection2")
        if (alreadyConnected != -1) {
            console.log("already connected")
            this.userArr.splice(alreadyConnected, 1)
        }
        console.log("id = ", arg)
        console.log('client id = ', client.id)
        const u: IStatus = {socketId: client.id, userStatus: "available", userId: arg}
        this.userArr.push(u)
        console.log('arr = ', this.userArr)
        this.logger.log(`client connection : ${client.id}`)
        client.broadcast.emit('newStatusConnection', u)
        return this.userArr
    }

    @SubscribeMessage('changeStatus')
    handleChangeStatus(client: Socket, arg: IStatus) {
        const changedIndex = this.userArr.findIndex((el) => el.socketId == client.id)
        if (changedIndex != -1) {
            this.userArr[changedIndex].userStatus = arg.userStatus
            client.broadcast.emit("newStatusChange", this.userArr[changedIndex])
        }
    }

    @SubscribeMessage('refuseChallenge')
    refuseChallenges(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        if (receiver) {
            console.log("i decline challenge from => ", receiver)
            this.server.to(receiver.socketId).emit('refuseChallenge', challenge)
        }
    }

    @SubscribeMessage('abortChallenge')
    abortChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenged})
        if (receiver) {
            console.log("i abort challenge to => ", receiver)
            this.server.to(receiver.socketId).emit('refuseChallenge', challenge)
        }
    }

    @SubscribeMessage('newChallenge')
    newChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenged})
        console.log("in new Challenge", this.userArr, "challenge = ",challenge, receiver)
        if (receiver) {
            console.log("i challenge => ", receiver)
            this.server.to(receiver.socketId).emit('newChallenge', challenge)
        }
    }

    @SubscribeMessage('challengeAccepted')
    acceptChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        if (receiver) {
            console.log("i accept challenge from => ", receiver)
            this.server.to(receiver.socketId).emit('challengeAccepted', challenge)
        }
    }
//
    @SubscribeMessage('findAllStatus')
    handleFindAll() {
        return this.userArr
    }
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
