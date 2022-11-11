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

type TStatus = "available" | "disconnected" | "inGame" | "challenged"

interface IStatus {
    socketId: string[];
    userId: number;
    userStatus: TStatus;
    inGameSocket: string;
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
           if (this.userArr[uIndex].inGameSocket == client.id) {
            client.broadcast.to('user_' + this.userArr[index].userId).emit('internStatusChange', 'available')
           }
        }
            
    }

    @SubscribeMessage('connectionStatus')
    handleConnection2(client: Socket, arg: number) {
        const index = this.userArr.findIndex((e) => {
            return e.userId == arg;
        })

        const newClients : string[] = []
        const u: IStatus = {socketId: newClients, userStatus: 'available', userId: arg, inGameSocket: ""}
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
    handleChangeStatus(client: Socket, userStatus: TStatus) {
        const index = this.userArr.findIndex((elem) => {
            if (elem.socketId.findIndex((e) => {return e == client.id}) != -1)
                return true
        })
        // const index = getUser(this.userArr, client.id)
        if (index == -1) {
            return
        }
        const id = this.userArr[index].userId
        if (userStatus == 'inGame' || (userStatus == 'challenged' && this.userArr[index].inGameSocket == '')) {
            this.userArr[index].inGameSocket = client.id
            client.broadcast.to("users_" + id).emit('internStatusChange', userStatus)
        }
        else if (client.id == this.userArr[index].inGameSocket) {
            this.userArr[index].inGameSocket = ""
            client.broadcast.to("users_" + id).emit('internStatusChange', userStatus)
        }
        this.userArr[index].userStatus = userStatus
        this.toSend[index].userStatus = userStatus
        const res = {userStatus, userId: id}
        client.broadcast.emit("externStatusChange", res)
        // TODO: => verif le front: je change de status sur internStatusCHange, je fais rien si extern.Userid == this.id
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
            this.server.to(challenge.socketId).emit('challengeAccepted', challenge)
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
