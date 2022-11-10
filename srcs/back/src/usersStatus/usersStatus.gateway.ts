import {
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

function getUser(arr: IStatus[], i: string) {
    return arr.findIndex((e) => {return e.socketId.includes(i)})
}


function countInArray(arr: IStatus[], i: number) {
    return arr.filter(item => item.userId == i).length
}

type TStatus = "available" | "disconnected" | "inGame"

interface IStatus {
    socketId: string[];
    userId: number;
    userStatus: TStatus;
}

type TChallenge = {challenger: Number, level: Number, challenged: Number}

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

    afterInit(server: Server) {
        //this.logger.log('Initialized')
    }


    async handleDisconnect(client: Socket) {
        const uIndex = getUser(this.userArr, client.id)
        if (uIndex == -1) {
            return
        }
        if (this.userArr[uIndex].socketId.length == 1) {
            client.broadcast.emit('newStatusDisconnection', this.userArr[uIndex])
            this.userArr.splice(uIndex, 1)
        } else {
           const index = this.userArr[uIndex].socketId.findIndex((e) => {
            e === client.id;
           })
           this.userArr[uIndex].socketId.splice(index, 1)
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
    handleConnection2(client: Socket, arg: number) {
        // const alreadyConnected = this.userArr.findIndex((el) => {console.log("el ==== ", el, "id ==== ", arg); return el.userId === arg})
        // console.log("handleConnection2")
        // if (alreadyConnected != -1) {
        //     console.log("already connected")
        //     this.userArr.splice(alreadyConnected, 1)
        // }
        const index = this.userArr.findIndex((e) => {
            return e.userId == arg;
        })

        const newClients : string[] = []
        const u: IStatus = {socketId: newClients, userStatus: 'available', userId: arg}
        if (index == -1) {
            newClients.push(client.id)
            this.userArr.push(u)
            client.broadcast.emit('newStatusConnection', {ISocket: u, ExistsAlready: false, sender: client.id})
        }
        else {
            this.userArr[index].socketId.push(client.id)
            client.join("user_" + index)
            console.log("user_" + index);
            client.broadcast.emit('newStatusConnection', {ISocket: u, ExistsAlready: true, sender: client.id})
        }
        return this.userArr
    }

    @SubscribeMessage('changeStatus')
    handleChangeStatus(client: Socket, arg: IStatus) {
        const index = getUser(this.userArr, client.id)
        if (index == -1) {
            return
        }
        this.userArr[index].userStatus = arg.userStatus
        client.broadcast.emit("newStatusChange", arg)
    }

    @SubscribeMessage('refuseChallenge')
    refuseChallenges(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {/*console.log(el);*/ return el.userId === challenge.challenger})
        if (receiver) {
            //console.log("i decline challenge from => ", receiver)
            this.server.to("user_" + receiver.userId.toString()).emit('refuseChallenge', challenge)
        }
    }

    @SubscribeMessage('abortChallenge')
    abortChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
        if (receiver) {
            //console.log("i abort challenge to => ", receiver)
            this.server.to("user_" + receiver.userId.toString()).emit('refuseChallenge', challenge)
        }
    }

    @SubscribeMessage('newChallenge')
    newChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
        //console.log("in new Challenge", this.userArr, "challenge = ",challenge, receiver)
        if (receiver) {
            console.log("i challenge => ", receiver)
            this.server.to("user_" + receiver.userId.toString()).emit('newChallenge', challenge)
        }
    }

    @SubscribeMessage('challengeAccepted')
    acceptChallenge(client: Socket, challenge: TChallenge) {
        const sender = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        const receiver = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        if (receiver) {
            //console.log("i accept challenge from => ", receiver)
            this.server.to("user_" + sender.userId.toString()).emit('challengeAccepted', challenge)
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
