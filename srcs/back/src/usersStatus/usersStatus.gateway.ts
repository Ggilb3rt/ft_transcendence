import {
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UsersService } from 'src/users/users.service';

function makeId(id: number) {
    return "user_" + id
}

type TStatus = "available" | "inGame" | "challenged"

type TChallenge = {challenger: number, level: number, challenged: number, socketId: string}

type TSend = {userId: number, userStatus: TStatus}

@WebSocketGateway({
	cors: {
        credentials: true,
        origin: /localhost\:[\d]*?\/?[\w]*$/
	},
    namespace: 'userStatus',
})
export class UsersStatusGateway implements OnGatewayInit, OnGatewayDisconnect {

    constructor(private usersService: UsersService) {}
    @WebSocketServer() server: Server;


    //private logger: Logger = new Logger('usersStatusGateway');

    afterInit(server: Server) {
        //this.logger.log('Initialized')
    }



    async fetchUserSockets(id: number) {
        const room = makeId(id)
        console.log(room)

        const clients = await this.server.in(room).fetchSockets();
        //console.log("number of clients = ", clients.length)
        return clients
    }

    getArrOfId(clients) {
        const arr: string[] = [];

        clients.forEach((client) => {
            arr.push(client.id);
        })
    }

    async getSockets(client: Socket) {
        let id
        if (client.handshake.headers.cookie)
            id = await this.usersService.getGatewayToken(client.handshake.headers, client)
        else
            id = client.handshake.query.userId
        //console.log("id == ", id)
        const sockets = await this.fetchUserSockets(id)
        const arr = this.getArrOfId(sockets)
        const arg = {id, sockets}
        return (arg)
    }


    async handleDisconnect(client: Socket) {
        const {id, sockets} = await this.getSockets(client)

        console.log("sockets == ", sockets.length)
        if (sockets.length == 0) {
            client.broadcast.emit('newStatusDisconnection', id)
            console.log("je retire 1 user")
        } 
        client.leave(makeId(id))
    }

    @SubscribeMessage('takeThat')
    async takeThat(client: Socket, arg: {userId: number, userStatus: string, newClient: string}) {
        const {userId, userStatus, newClient } = arg
        this.server.to(newClient).emit('takeThat', {userId, userStatus})
    }

    @SubscribeMessage('connectionStatus')
    async handleConnection(client: Socket) {
        const {id, sockets} = await this.getSockets(client)
		if (client.handshake.headers.cookie) {
        client.join(makeId(id))
        
        //console.log("DEUXIEME FOIS -------------")
        await this.getSockets(client);
        client.broadcast.emit('newStatusConnection', {userId: id, newClient: client.id})
		}
    }

    @SubscribeMessage('changeStatus')
    async handleChangeStatus(client: Socket, userStatus: TStatus) {
        await this.getSockets(client)

        client.broadcast.emit("newStatusChange", userStatus)
    }
    // @SubscribeMessage('changeStatus')
    // handleChangeStatus(client: Socket, arg: {userStatus: "available" | "inGame" | "challenged", userId: number, force? : boolean}) {
    //     const index = this.userArr.findIndex((elem) => {
    //         return elem.userId == arg.userId
    //     })
    //     if (index == -1) {
    //         return
    //     }
    //     const elem = this.userArr[index];

    //     if (elem.inGame && client.id != elem.inGame.id)
    //         return

    //     if (elem.userStatus == 'challenged' && arg.userStatus == 'available' && !arg.force)
    //         return
    //     if (elem.inGame && arg.userStatus == 'available') {
    //         elem.inGame = null
    //     }
    //     else if (!elem.inGame && arg.userStatus == 'inGame') {
    //         elem.inGame = client
    //     }

    //     this.userArr[index].userStatus = arg.userStatus
    //     this.toSend[index].userStatus = arg.userStatus

    //     client.broadcast.emit("newStatusChange", arg)
    // }



    @SubscribeMessage('newChallenge')
    async newChallenge(client: Socket, challenge: TChallenge) {
        const {challenged, challenger } = challenge

        const socket = client.id
        console.log("client_id = ", client.id)
        client.to(makeId(challenged)).emit('newChallenge', {challenge, socket})
    }

    @SubscribeMessage('alreadyChallenged')
    async alreadyChallenged(client: Socket, to: string) {
        const {id, sockets} = await this.getSockets(client)

        console.log("to = ", to);

        this.server.to(to).emit('alreadyChallenged')
    }

    @SubscribeMessage('challengeOk')
    async challengeOk(client: Socket, socket: string) {
        const {id, sockets} = await this.getSockets(client)

        this.server.to(socket).emit('challengeOk')
    }

    @SubscribeMessage('acceptChallenge')
    async acceptChallenge(client: Socket, challenge: TChallenge) {
        const {id, sockets} = await this.getSockets(client)

        client.to(makeId(challenge.challenger)).emit('challengeAccepted', challenge)
        client.broadcast.to(makeId(challenge.challenged)).emit('challengeAccepted', challenge)
    }

    @SubscribeMessage('refuseChallenge')
    async refuseChallenges(client: Socket, challenge: TChallenge) {
        const {id, sockets} = await this.getSockets(client)

        client.to(makeId(challenge.challenger)).emit('refuseChallenge', challenge)
        client.broadcast.to(makeId(challenge.challenged)).emit('refuseChallenge', challenge)
    }
    // @SubscribeMessage('newChallenge')
    // newChallenge(client: Socket, challenge: TChallenge) {
    //     const challenged = this.userArr.findIndex((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
    //     const challenger = this.userArr.findIndex((el) => {/*console.log(el);*/ return el.userId === challenge.challenger})
    //     // console.log("in new Challenge", this.userArr, "challenge = ",challenge, challenged)\

    //     // console.log("challenger == ", this.userArr[challenger].userStatus, "challenged", this.userArr[challenged].userStatus )
    //     if (challenged == -1 || challenger == -1 || this.userArr[challenger].userStatus != 'available' || this.userArr[challenger].userStatus != 'available') {
    //         return false
    //     }
    //         // console.log("i challenge => ", challenged)
    //         this.userArr[challenged].userStatus = 'challenged' 
    //         this.userArr[challenger].userStatus = 'challenged' 


    //         this.userArr[challenger].inGame = client 

            
    //         this.toSend[challenged].userStatus = 'challenged'
    //         this.toSend[challenger].userStatus = 'challenged'


    //         this.server.to("user_" + this.userArr[challenged].userId).emit('newChallenge', challenge)


    //         const arg = this.toSend[challenged]
    //         const arg2 = this.toSend[challenger]
    //         console.log("arg == ", )


    //         this.server.emit("newStatusChange", arg)
    //         this.server.emit("newStatusChange", arg2)
    //         return true
    // }

    // @SubscribeMessage('refuseChallenge')
    // refuseChallenges(client: Socket, challenge: TChallenge) {
    //     const receiver = this.userArr.findIndex((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
    //     //console.log("in new Challenge", this.userArr, "challenge = ",challenge, receiver)\

    //     if (receiver == -1 || sender == -1) {
    //         return false
    //     }

    //     //console.log("i decline challenge from => ", receiver)
    //     this.userArr[receiver].userStatus = 'available'
    //     this.userArr[sender].userStatus = 'available'


    //     this.toSend[receiver].userStatus = 'available'
    //     this.toSend[sender].userStatus = 'available'


    //     client.broadcast.to("user_" + this.userArr[receiver].userId).emit('refuseChallenge', challenge)
    //     this.server.to("user_" + this.userArr[sender].userId).emit('refuseChallenge', challenge)


    //     const arg = this.toSend[receiver]
    //     const arg2 = this.toSend[sender]


    //     console.log("arg == ", arg)


    //     this.server.emit("newStatusChange", arg)
    //     this.server.emit("newStatusChange", arg2)
//     //     return true
//     // }

//     @SubscribeMessage('challengeAccepted')
//     acceptChallenge(client: Socket, challenge: TChallenge) {
//         const challenged = this.userArr.findIndex((el) => {/*console.log(el);*/ return el.userId === challenge.challenged})
//         const challenger = this.userArr.findIndex((el) => {/*console.log(el);*/ return el.userId === challenge.challenger})
//         //console.log("in new Challenge", this.userArr, "challenge = ",challenge, challenged)\

//         if (challenged == -1 || challenger == -1 || this.userArr[challenger].userStatus != 'challenged' || this.userArr[challenger].userStatus != 'challenged') {
//             return false
//         }

//         //console.log("i accept challenge from => ", challenged)
//         this.userArr[challenged].userStatus = 'inGame' 
//         this.userArr[challenger].userStatus = 'inGame'
        
        
//         this.toSend[challenged].userStatus = 'inGame'
//         this.toSend[challenger].userStatus = 'inGame'

//         const challengedSocket = this.userArr[challenger].inGame;

//         this.server.to(challengedSocket.id).emit('challengeAccepted', challenge)
//         challengedSocket.broadcast.to("user_" + this.userArr[challenged].userId).emit('challengeAcceptedByMe', challenge)


//         const arg = this.toSend[challenged]
//         const arg2 = this.toSend[challenger]

//         this.server.emit("newStatusChange", arg)
//         this.server.emit("newStatusChange", arg2)

//         return true
//     }
// //
//     // @SubscribeMessage('chatToServer')
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
