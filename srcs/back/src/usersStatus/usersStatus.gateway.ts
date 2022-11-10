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
            client.broadcast.emit('newStatusDisconnection', {ISocket: this.userArr[uIndex], ExistsAlready: false, sender: client.id})
            this.userArr.splice(uIndex, 1)
        } else {
            console.log("je retire mon client")
           const index = this.userArr[uIndex].socketId.findIndex((e) => {
            e === client.id;
           })
           client.broadcast.emit('newStatusDisconnection', {ISocket: this.userArr[uIndex], ExistsAlready: true, sender: client.id})
           this.userArr[uIndex].socketId.splice(index, 1)
        }
            
    }

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
            client.join("user_" + u.userId)
            console.log("user_" + u.userId);
            client.broadcast.emit('newStatusConnection', {ISocket: u, ExistsAlready: true, sender: client.id})
        }
        this.server.to(client.id).emit('takeThat', this.userArr)
    }

    @SubscribeMessage('changeStatus')
    handleChangeStatus(client: Socket, arg: IStatus) {
        console.log("\n\n------JE RENTRE DANS CHANGE STATUS")
        const index = this.userArr.findIndex((elem) => {
            if (elem.socketId.findIndex((e) => {return e == client.id}) != -1)
                return true
        })
        // const index = getUser(this.userArr, client.id)
        if (index == -1) {
            return
        }
        this.userArr[index].userStatus = arg.userStatus
        console.log("\n\n----------------- THIS USER ARR-------------\n\n", this.userArr)
        client.broadcast.emit("newStatusChange", arg)
    }

    @SubscribeMessage('refuseChallenge')
    refuseChallenges(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {/*console.log(el);*/ return el.userId === challenge.challenger})
        if (receiver) {
            //console.log("i decline challenge from => ", receiver)
            this.server.to("user_" + receiver.userId).emit('refuseChallenge', challenge)
        }
    }

    @SubscribeMessage('abortChallenge')
    abortChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
        if (receiver) {
            //console.log("i abort challenge to => ", receiver)
            this.server.to("user_" + receiver.userId).emit('refuseChallenge', challenge)
        }
    }

    @SubscribeMessage('newChallenge')
    newChallenge(client: Socket, challenge: TChallenge) {
        const receiver = this.userArr.find((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
        //console.log("in new Challenge", this.userArr, "challenge = ",challenge, receiver)
        if (receiver) {
            console.log("i challenge => ", receiver)
            this.server.to("user_" + receiver.userId).emit('newChallenge', challenge)
        }
    }

    @SubscribeMessage('challengeAccepted')
    acceptChallenge(client: Socket, challenge: TChallenge) {
        const sender = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        const receiver = this.userArr.find((el) => {console.log(el); return el.userId === challenge.challenger})
        if (receiver) {
            //console.log("i accept challenge from => ", receiver)
            this.server.to("user_" + sender.userId).emit('challengeAccepted', challenge)
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
