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
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit {
 
    @WebSocketServer() server: Server;

    private logger: Logger = new Logger('ChatGateway');

    afterInit(server: Server) {
        this.logger.log('Initialized')
    }
 
    @SubscribeMessage('chatToServer')
    handleMessage(client: any, payload: { sender: string, room: string, payload: string }) {
        // Le to() permet d'emit a une room specifique et non pas a tout le namespace
        this.server.to(payload.room).emit('chatToClient', payload);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, room: string) {
        client.join(room);
        //Only to this specific client
        client.emit('joinedRoom', room);
    }

    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(client: Socket, room: string) {
        client.leave(room);
        client.emit('leftRoom', room);
    }

}
