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
import { TMessage } from 'src/users/types';


@WebSocketGateway({
	cors: {
        credentials: true,
        origin: /localhost\:[\d]*?\/?[\w]*$/
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

    async handleConnection(client: Socket) {

    }

    @SubscribeMessage('getMyRooms')
    async getMyRooms(client: Socket) {

        const ids: number[] = [];
        const rooms: string[] = [];

        const user_id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const friends_id = await this.usersService.getFriends(user_id)
        const { joinedChannels } = await this.chatService.getAvailableChannels(user_id)

        joinedChannels.forEach((elem) => {
            ids.push(elem.id)
        });

        ids.forEach((id) => {
            rooms.push(id.toString())
        })

        friends_id.forEach((friend) => {
            rooms.push('u' + friend.toString())
        })

        client.join(rooms)
        return (rooms)
    }

    @SubscribeMessage('sendMessageToChannel')
    async sendMessageToChannel(client: Socket, room: string, content: string, date: Date) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.sendMessageToChannel(parseInt(room), content, date, id)

        const message: TMessage = {
            receiver: parseInt(room),
            sender: id,
            msg: content,
            isDirect: false,
            date,
        }
        client.broadcast.to(room).emit('messageSentToChannel', message, room)
    }

    @SubscribeMessage('sendDirectMessage')
    async sendDirectMessage(client: Socket, room: string, content: string, date: Date) {
    
        
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.sendDirectMessage(parseInt(room), content, date, id)

        const message: TMessage = {
            receiver: parseInt(room),
            sender: id,
            msg: content,
            isDirect: true,
            date,
        }
        client.broadcast.to(room).emit('directMessageSent', message, room)
    }

    @SubscribeMessage('promote')
    async promoteUser(client: Socket, promoted_id: number, room: string) {

        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.promoteAdmin(promoted_id, parseInt(room), id);

        client.broadcast.to(room).emit('promoted', {
            promoted_id,
            channel_id: room
        })
    }

    @SubscribeMessage('kick')
    async kickUser(client: Socket, kicked_id: number, channel_id: number, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.kickUser(channel_id, kicked_id, id)
        client.broadcast.to(room).emit('kick', {
            kicked_id,
            kicked_by: id,
            channel_id: room
        })
    }

    @SubscribeMessage('ban')
    async banUser(client: Socket, banned_id: number, channel_id: number, expires: Date, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.banUser(channel_id, banned_id, expires, id)
        client.broadcast.to(room).emit('ban', {
            banned_id,
            banned_by: id,
            expires,
            channel_id: room
        })
    }

    @SubscribeMessage('mute')
    async muteUser(client: Socket, banned_id: number, channel_id: number, expires: Date, room: string) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.muteUser(channel_id, banned_id, expires, id)
        client.broadcast.to(room).emit('mute', {
            banned_id,
            banned_by: id,
            expires,
            channel_id: room
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
            client_quit: id,
            channel_id
        })
        client.leave(room)
    }

    handleDisconnect(client: any) {
        client.disconnect()
    }
}