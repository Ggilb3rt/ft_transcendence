import {
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
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
    // namespace: 'usersStatus',
})
export class UsersStatusGateway implements OnGatewayInit, OnGatewayDisconnect {
 
    @WebSocketServer() server: Server;

    private logger: Logger = new Logger('usersStatusGateway');
    private userArr: IStatus[] = []

    afterInit(server: Server) {
        this.logger.log('Initialized')
    }


    handleDisconnect(client: Socket) {
        this.logger.log(`client disconnect : ${client.id}`)
        let uIndex = this.userArr.findIndex(el => el.socketId == client.id)
        if (uIndex != -1) {
            this.server.sockets.emit('newStatusDisconnection', this.userArr[uIndex])
            this.userArr.splice(uIndex, 1)
        }
    }

    // handleConnection(client: Socket, ...args: any[]) {
    //     // this.userList.set(Number(client.id), client)
    //     const u: IStatus = {socketId: client.id, userStatus: "available", userId: args[0]}
    //     this.userArr.push(u)
    //     this.logger.log(`client connection : ${client.id}`)
    //     this.server.sockets.emit('newStatusConnection', u)
    //     return this.userArr
    // }


    @SubscribeMessage('connectionStatus')
    handleConnection2(client: Socket, arg: number) {
        const u: IStatus = {socketId: client.id, userStatus: "available", userId: arg}
        this.userArr.push(u)
        this.logger.log(`client connection : ${client.id}`)
        this.server.sockets.emit('newStatusConnection', u)
        return this.userArr
    }

    @SubscribeMessage('changeStatus')
    handleChangeStatus(client: Socket, arg: IStatus) {
        const changedIndex = this.userArr.findIndex((el) => el.socketId == client.id)
        if (changedIndex != -1) {
            this.userArr[changedIndex].userStatus = arg.userStatus
            this.server.sockets.emit("newStatusChange", this.userArr[changedIndex])
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