import {
    WebSocketServer,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect,
    OnGatewayConnection,
    SubscribeMessage} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';
import { TMessage } from 'src/users/types';
import { users_list } from '@prisma/client';


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
    async sendMessageToChannel(client: Socket, arg: {room: string, content: string, date: Date}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {room, content, date} = arg
        await this.chatService.sendMessageToChannel(parseInt(room), content, date, id)

        const message: TMessage = {
            receiver: parseInt(room),
            sender: id,
            msg: content,
            isDirect: false,
            date,
        }
        client.broadcast.to(room).emit('messageSentToChannel', message, room)
        return (true)
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
    async promoteUser(client: Socket, arg: {promoted_id: number, room: string}) {

        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { promoted_id, room} = arg
        await this.chatService.promoteAdmin(promoted_id, parseInt(room), id);

        client.broadcast.to(room).emit('promoted', {
            promoted_id,
            channel_id: room
        })
    }

    @SubscribeMessage('kick')
    async kickUser(client: Socket, arg: { channel_id: number, room: string, kicked_id: number }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, room, kicked_id } = arg

        await this.chatService.kickUser(channel_id, kicked_id, id)
        client.broadcast.to(room).emit('kick', {
            kicked_id,
            kicked_by: id,
            channel_id: room
        })
    }

    @SubscribeMessage('ban')
    async banUser(client: Socket, arg: { channel_id: number, room: string, banned_id: number, expires: Date }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, room, banned_id, expires} = arg

        await this.chatService.banUser(channel_id, banned_id, expires, id)
        client.broadcast.to(room).emit('ban', {
            banned_id,
            banned_by: id,
            expires,
            channel_id: room
        })
    }

    @SubscribeMessage('mute')
    async muteUser(client: Socket, arg: { channel_id: number, room: string, banned_id: number, expires: Date }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, room, banned_id, expires} = arg
        await this.chatService.muteUser(channel_id, banned_id, expires, id)
        client.broadcast.to(room).emit('mute', {
            banned_id,
            banned_by: id,
            expires,
            channel_id: room
        })
    }

    @SubscribeMessage('join')
    async joinChannel(client: Socket, basicJoin: {room: string, channel_id: number, pass?: string}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, room, pass} = basicJoin
        const res: users_list | null = await this.chatService.joinChannel(id, channel_id, pass)
        client.broadcast.to(room).emit('join', {
            new_client: id,
            channel_id
        })
        
        console.log("bonjour le join de ", room, res, Boolean(res))
        return {status: Boolean(res)}
    }

    @SubscribeMessage('quit')
    async quitChannel(client: Socket, arg: { channel_id: number, room: string }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, room} = arg
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