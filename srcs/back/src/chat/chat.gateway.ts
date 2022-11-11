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


function makeId(isDirect: boolean, id: number) {
    return isDirect ? "user_" + id : "channel_" + id
}

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
            rooms.push(makeId(false, id))
        })
    
        client.join(rooms)
        client.join(makeId(true, user_id))
        console.log("Rooms pour le user_" + user_id, " = ", rooms)
        return (rooms)
    }

    @SubscribeMessage('sendMessageToChannel')
    async sendMessageToChannel(client: Socket, arg: {channel_id: number, content: string, date: Date}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, content, date} = arg
        await this.chatService.sendMessageToChannel(channel_id, content, date, id)

        const message: TMessage = {
            receiver: channel_id,
            sender: id,
            msg: content,
            isDirect: false,
            date,
        }
        // const size = this.server.sockets.adapter.rooms[room].size
        // console.log("\n\navant le broadcast", id, client.id, "\n DANS ROOM = ", room, "ils sont ", size),
        console.log("JE VAIS EMIT DANS LA ROOM => ", makeId(false, channel_id), "\n LE MESSAGE", message)
        client.broadcast.to(makeId(false, channel_id)).emit('messageSentToChannel', message)
        return (true)
    }

    @SubscribeMessage('sendDirectMessage')
    async sendDirectMessage(client: Socket, content: string, receiver: number, date: Date) {
    
        
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        await this.chatService.sendDirectMessage(receiver, content, date, id)

        // if not banned
        // if friends
        const message: TMessage = {
            receiver,
            sender: id,
            msg: content,
            isDirect: true,
            date,
        }
        client.to(makeId(true, id)).emit('directMessageSent', message)
    }

    @SubscribeMessage('promote')
    async promoteUser(client: Socket, arg: {promoted_id: number, channel_id: number}) {

        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { promoted_id, channel_id} = arg
        await this.chatService.promoteAdmin(promoted_id, channel_id, id);

        client.broadcast.to(makeId(false, channel_id)).emit('promoted', {
            promoted_id,
            channel_id
        })
    }

    @SubscribeMessage('kick')
    async kickUser(client: Socket, arg: { channel_id: number, kicked_id: number }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, kicked_id } = arg

        await this.chatService.kickUser(channel_id, kicked_id, id)
        client.broadcast.to(makeId(false, channel_id)).emit('kick', {
            kicked_id,
            kicked_by: id,
            channel_id
        })
    }

    @SubscribeMessage('ban')
    async banUser(client: Socket, arg: { channel_id: number, banned_id: number, expires: Date }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, banned_id, expires} = arg

        await this.chatService.banUser(channel_id, banned_id, expires, id)
        client.broadcast.to(makeId(false, channel_id)).emit('ban', {
            banned_id,
            banned_by: id,
            expires,
            channel_id
        })
    }

    @SubscribeMessage('mute')
    async muteUser(client: Socket, arg: { channel_id: number, banned_id: number, expires: Date }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, banned_id, expires} = arg
        await this.chatService.muteUser(channel_id, banned_id, expires, id)
        client.broadcast.to(makeId(false, channel_id)).emit('mute', {
            banned_id,
            banned_by: id,
            expires,
            channel_id
        })
    }

    @SubscribeMessage('join')
    async joinChannel(client: Socket, basicJoin: {channel_id: number, pass?: string}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, pass} = basicJoin
        const res: users_list | null = await this.chatService.joinChannel(id, channel_id, pass)
        client.broadcast.to(makeId(false, channel_id)).emit('join', {
            new_client: id,
            channel_id
        })
        client.join(makeId(false, channel_id))
        console.log("bonjour le join de ", makeId(false, channel_id), res, Boolean(res))
        return {status: Boolean(res)}
    }

    @SubscribeMessage('quit')
    async quitChannel(client: Socket, arg: { channel_id: number }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id } = arg
        await this.chatService.kickUser(channel_id, id, id)
        client.broadcast.to(makeId(false, channel_id)).emit('quit', {
            client_quit: id,
            channel_id
        })
        client.leave(makeId(false, channel_id))
    }

    handleDisconnect(client: any) {
        client.disconnect()
    }
}