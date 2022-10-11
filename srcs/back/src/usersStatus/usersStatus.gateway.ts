import {
    WebSocketServer,
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
	cors: {
		origin: '*'
	},
    // namespace: '/usersStatus',
})
export class UsersStatusGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 
    @WebSocketServer() server: Server;

    private logger: Logger = new Logger('usersStatusGateway');
    private userList: Map<number, Object> = new Map<number, Object>()

    afterInit(server: Server) {
        this.logger.log('Initialized')
    }
 

    handleDisconnect(client: Socket) {
        this.logger.log("client disconnect : ", client.id)
        this.userList.delete(1)
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.userList.set(1, client)
        this.logger.log("client connection : ", client.id)
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
