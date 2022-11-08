import {
    WebSocketServer,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect,
    OnGatewayConnection,
    SubscribeMessage} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ForbiddenException, Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';


@WebSocketGateway({
	cors: {
		origin: '*'
	},
    namespace: 'chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
    constructor(private chatService: ChatService,  private usersService: UsersService) {}
    @WebSocketServer() server: Server;

    // this.server.use()


    private logger: Logger = new Logger('chatGateway');

    afterInit(server: Server) {
        this.logger.log('Chat Gateway Initialized')
    }

    async handleConnection(client: Socket, user_id: number) {

        await this.chatService.getGatewayToken(client.handshake.headers, client)


        const ids: number[] = [];
        const rooms: string[] = [];


        const friends_id = await this.usersService.getFriends(user_id)
        const { joinedChannels } = await this.chatService.getAvailableChannels(user_id)

        joinedChannels.forEach((elem) => {
            ids.push(elem.id)
        });

        ids.forEach((id) => {
            rooms.push(id.toString())
        })

        friends_id.forEach((friend) => {
            rooms.push('users/' + friend.toString())
        })

        client.join(rooms)
        return (rooms)
    }

    @SubscribeMessage('sendMessageToChannel')
    async sendMessageToChannel(client: Socket, room: string, user_id: number, content: string, date: Date) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.sendMessageToChannel(parseInt(room), content, date, id)
        client.broadcast.to(room).emit('messageSentToChannel', {
            channel_id: parseInt(room),
            content,
            date,
            sender: id
        })
    }

    @SubscribeMessage('sendDirectMessage')
    async sendDirectMessage(client: Socket, room: string, user_id: number, content: string, date: Date) {
    
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.sendDirectMessage(user_id, content, date, id)
        client.broadcast.to(room).emit('directMessageSent', {
            sender: id,
            content,
            date
        })
    }

    @SubscribeMessage('promote')
    async promoteUser(client: Socket, promoted_id: number, channel_id: number, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.promoteAdmin(promoted_id, channel_id, id);
        client.broadcast.to(room).emit('promoted', {
            promoted_id,
            promoted_by: id
        })
    }

    @SubscribeMessage('kick')
    async kickUser(client: Socket, kicked_id: number, channel_id: number, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.kickUser(channel_id, kicked_id, id)
        client.broadcast.to(room).emit('kick', {
            kicked_id,
            kicked_by: id
        })
    }

    @SubscribeMessage('ban')
    async banUser(client: Socket, banned_id: number, channel_id: number, expires: Date, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.banUser(channel_id, banned_id, expires, id)
        client.broadcast.to(room).emit('ban', {
            banned_id,
            banned_by: id,
            expires
        })
    }

    @SubscribeMessage('mute')
    async muteUser(client: Socket, banned_id: number, channel_id: number, expires: Date, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.muteUser(channel_id, banned_id, expires, id)
        client.broadcast.to(room).emit('mute', {
            banned_id,
            banned_by: id,
            expires
        })
    }

    @SubscribeMessage('join')
    async joinChannel(client: Socket, channel, room: string, pass?) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.joinChannel(id, channel, pass)
        client.broadcast.to(room).emit('join', {
            new_client: id,
            channel_id: channel.id
        })
    }

    @SubscribeMessage('quit')
    async quitChannel(client: Socket, channel_id: number, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.kickUser(channel_id, id, id)
        client.broadcast.to(room).emit('quit', {
            new_client: id,
            channel_id
        })
        client.leave(room)
    }

    handleDisconnect(client: any) {
        client.disconnect()
    }
}