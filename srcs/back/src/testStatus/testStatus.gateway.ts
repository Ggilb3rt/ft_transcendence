import {
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';


type TStatus = "available" | "disconnected" | "inGame"
interface IStatus {
    socketId: string;
    userId: number;
    userStatus: TStatus;
}

@WebSocketGateway({
	cors: {
		origin: '*'
	},
    namespace: 'test',
})
export class testStatusGateway implements OnGatewayInit, OnGatewayDisconnect {
 
    @WebSocketServer() server: Server;


    private logger: Logger = new Logger('usersStatusGateway');
    private userArr: IStatus[] = []

    afterInit(server: Server) {
        this.logger.log('Initialized')
    }


    async handleDisconnect(client: Socket) {
        // this.server.emit('client disconnected')
        console.log("TEST GATEWAY");
        const sockets = await this.server.fetchSockets()
        sockets.forEach(element => {
            console.log("id == ", element.id)
        });
        console.log()
        this.logger.log(`client disconnect : ${client.id}`)
        let uIndex = this.userArr.findIndex(el => el.socketId == client.id)
        if (uIndex != -1) {
            this.server.emit('newStatusDisconnection', this.userArr[uIndex])
            // this.server.emit("toto")
            this.userArr.splice(uIndex, 1)
        }
    }

    // handleConnection(client: Socket, ...args: any[]) {
    //     // this.userList.set(Number(client.id), client)
    //     const u: IStatus = {socketId: client.id, userStatus: "available", userId: args[0]}
    //     this.userArr.push(u)
    //     this.logger.log(`client connection : ${client.id}`)
        // this.server.sockets.emit('newStatusConnection', u)
    //     return this.userArr
    // }


    @SubscribeMessage('connectionStatus')
    async handleConnection2(client: Socket, arg: number) {
        console.log("TEST GATEWAY");
        const sockets = await this.server.fetchSockets()
        sockets.forEach(element => {
            console.log("id == ", element.id)
        });
        console.log()
        const u: IStatus = {socketId: client.id, userStatus: "available", userId: arg}
        this.userArr.push(u)
        this.logger.log(`client connection : ${client.id}`)
        // nsp.emit('newStatusConnection', u)
        return this.userArr
    }

    @SubscribeMessage('changeStatus')
    handleChangeStatus(client: Socket, arg: IStatus) {
        // const nsp = this.server.of("/usersStatus")
        const changedIndex = this.userArr.findIndex((el) => el.socketId == client.id)
        if (changedIndex != -1) {
            // nsp.emit("newStatusChange", this.userArr[changedIndex])
            this.userArr[changedIndex].userStatus = arg.userStatus
        }
    }

    // @SubscribeMessage('findAllStatus')
    // handleFindAll() {
    //     return this.userArr
    // }
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
