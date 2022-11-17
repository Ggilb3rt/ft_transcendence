import {
    WebSocketServer,
    WebSocketGateway,
    OnGatewayInit,
    OnGatewayDisconnect,
    OnGatewayConnection,
    SubscribeMessage} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { UsersService } from 'src/users/users.service';
import { TChannelType, TMessage } from 'src/users/types';
import { ban_channels, muted, users_list } from '@prisma/client';


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
    constructor(
    @Inject(forwardRef(() => ChatService))
        private chatService: ChatService,  private usersService: UsersService) {}
    @WebSocketServer() server: Server;


    private logger: Logger = new Logger('chatGateway');

    afterInit(server: Server) {
        this.logger.log('Chat Gateway Initialized')
    }

    async unBanExpired(user_id: number) {

            const bans: ban_channels[] = await this.chatService.getMyBans(user_id)
            
            bans.forEach(async (ban) => {
                if(ban.expires < new Date()) {
                    
                    await this.chatService.unBan(ban)
                    await this.unBan(user_id, ban.channel_id)
                }
                else {
                    await this.leaveChannelId(user_id, ban.channel_id)
                }
            })
    }

    async unMuteExpired(user_id: number) {

        const myMutes: muted[] = await this.chatService.getMyMutes(user_id);

        myMutes.forEach(async (mute) => {
            if(mute.mute_date < new Date()) {
                await this.chatService.unMute(mute.channel_id, mute.muted_id)
            }
        })
    }

    async handleConnection(client: Socket) {

    }

    async leaveChannelId(banned_id: number, channel_id: number) {
        const room = makeId(true, banned_id)
        
        const clients = await this.server.in(room).fetchSockets();
        
        clients.forEach((client) => {
            
            
            client.leave(makeId(false, channel_id))
        })
    }
    
    async unBan(banned_id: number, channel_id: number) {
        const room = makeId(true, banned_id)
        const clients = await this.server.in(room).fetchSockets();

        clients.forEach((client) => {
            client.join(makeId(true, channel_id))
        })
    }

    @SubscribeMessage('getMyRooms')
    async getMyRooms(client: Socket) {

        let user_id;
        if (!client.handshake.headers.cookie)
            user_id = client.handshake.query.userId;
        else
            user_id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const ids: number[] = [];
        const rooms: string[] = [];

        const myChannels: users_list[] = await this.chatService.getMyChannels(user_id)

        if (!myChannels)
            return false

      

        const { joinedChannels, availableChannels } = await this.chatService.getAvailableChannels(user_id, myChannels)

        if (!joinedChannels || !availableChannels)
            return false

        joinedChannels.forEach((elem) => {
            ids.push(elem.id)
        });

        ids.forEach((id) => {
            rooms.push(makeId(false, id))
        })
        client.join(rooms)
        client.join(makeId(true, user_id))

        await this.unBanExpired(user_id)
        await this.unMuteExpired(user_id)

        return ({joinedChannels, availableChannels})
    }

    @SubscribeMessage('sendMessageToChannel')
    async sendMessageToChannel(client: Socket, arg: {channel_id: number, content: string, date: Date}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, content, date} = arg
        if (!await this.chatService.sendMessageToChannel(channel_id, content, date, id))
            return false

        const message: TMessage = {
            receiver: channel_id,
            sender: id,
            msg: content,
            isDirect: false,
            date,
        }
        
        
        client.broadcast.to(makeId(false, channel_id)).emit('messageSentToChannel', message)
        return (true)
    }

    @SubscribeMessage('sendDirectMessage')
    async sendDirectMessage(client: Socket, arg: { content: string, receiver: number, date: Date}) {
        
        
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        

        const { content, receiver, date} = arg

        if (await this.usersService.isBan(id, receiver) == true)
            return

        

        const res = await this.chatService.sendDirectMessage(receiver, content, date, id)

        

        if (!res)
            return false
        const message: TMessage = {
            receiver,
            sender: id,
            msg: content,
            isDirect: true,
            date,
        }
        
        client.to(makeId(true, receiver)).emit('directMessageSent', message)
        return (true)
    }


    @SubscribeMessage('demoted')
    async demoteUser(client: Socket, arg: { channel_id: number, demoted_id: number}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, demoted_id} = arg

        const res = await this.chatService.demote(channel_id, demoted_id, id)
        if (!res) {
            return false
        }
        client.broadcast.to(makeId(false, channel_id)).emit('demoted', {
            channel_id,
            demoted_id,
            id
        })
        return (true)
    }

    @SubscribeMessage('promote')
    async promoteUser(client: Socket, arg: {promoted_id: number, channel_id: number}) {

        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { promoted_id, channel_id} = arg

        const res = await this.chatService.promoteAdmin(promoted_id, channel_id, id);

        if (!res)
            return false
        client.broadcast.to(makeId(false, channel_id)).emit('promoted', {
            promoted_id: promoted_id,
            channel_id,
            promoted_by: id,
        })
        return true
    }

    @SubscribeMessage('kick')
    async kickUser(client: Socket, arg: { channel_id: number, kicked_id: number }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, kicked_id } = arg

        const res = await this.chatService.kickUser(channel_id, kicked_id, id)
        if (!res)
            return false
        this.leaveChannelId(channel_id, kicked_id)
        client.broadcast.to(makeId(false, channel_id)).emit('kick', {
            kicked_id,
            kicked_by: id,
            channel_id
        })
        return true
    }

    @SubscribeMessage('ban')
    async banUser(client: Socket, arg: { channel_id: number, banned_id: number, expires: Date }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)
        

        const { channel_id, banned_id, expires} = arg

        const res: boolean = await this.chatService.banUser(channel_id, banned_id, expires, id)
        

        if (!res)
            return false
        this.leaveChannelId(banned_id, channel_id)

        client.broadcast.to(makeId(false, channel_id)).emit('ban', {
            banned_id,
            banned_by: id,
            expires,
            channel_id
        })
        return true
    }

    @SubscribeMessage('passChange')
    async passChange(client: Socket, arg: { channel_id: number, pass: string}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, pass} = arg;


        const res = await this.chatService.changePass(channel_id, id, pass)
        return res
    }

    @SubscribeMessage('typeChange')
    async changeType(client: Socket, arg: { channel_id: number, type: TChannelType, pass?: string }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)
        
        const {channel_id, type, pass} = arg;
        const res = await this.chatService.changeChannelType(channel_id, type, id, pass)
        if (!res)
            return false
        client.broadcast.to(makeId(false, channel_id)).emit('typeChanged', {channel_id, type, id, pass})
        return true
    }

    @SubscribeMessage('mute')
    async muteUser(client: Socket, arg: { channel_id: number, banned_id: number, expires: Date }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const { channel_id, banned_id, expires} = arg
        
        const res = await this.chatService.muteUser(channel_id, banned_id, expires, id)
        if (!res)
            return false
        client.broadcast.to(makeId(false, channel_id)).emit('mute', {
            banned_id,
            banned_by: id,
            expires,
            channel_id
        })
        return true
    }

    @SubscribeMessage('join')
    async joinChannel(client: Socket, basicJoin: {channel_id: number, pass?: string}) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id, pass} = basicJoin
        const type: string = await this.chatService.getChannelType(channel_id)

        const res: {msg: string, status: boolean} = await this.chatService.joinChannel(id, channel_id, pass)
        
    
        if (res.status == false)
            return res
        this.server.to(makeId(false, channel_id)).emit('join', {
            new_client: id,
            channel_id
        })
        client.join(makeId(false, channel_id))
        return res
    }

    @SubscribeMessage('quit')
    async quitChannel(client: Socket, arg: { channel_id: number }) {
        const id = await this.chatService.getGatewayToken(client.handshake.headers, client)

        const {channel_id } = arg
        const res = await this.chatService.kickUser(channel_id, id, id)
        if (!res)
            return false
        this.leaveChannelId(channel_id, id)
        client.broadcast.to(makeId(false, channel_id)).emit('quit', {
            client_quit: id,
            channel_id
        })
        return true
    }

    handleDisconnect(client: any) {
        client.disconnect()
    }
}