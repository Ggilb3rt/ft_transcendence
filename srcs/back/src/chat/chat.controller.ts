import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { TChannel, TMessageRestrict } from 'src/users/types';
import { ChatService } from './chat.service';

@Controller('channels')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private chatService: ChatService) {}

    @Get()
    getChannels(@Req() req: Request) {
        return this.chatService.getAvailableChannels(req)
    }

    @Post()
    createChannel(@Body('channel') channel: TChannel) {
        return this.chatService.createChannel(channel)
    }

    @Get(':id')
    getChannel(@Param('id', ParseIntPipe) channel_id: number, @Req() req: Request) {
        return this.chatService.getChannel(channel_id, req)
    }

    @Get('/user:id')
    getDirectConversation(@Param('id', ParseIntPipe) friend: number, @Req() req: Request) {
        return this.chatService.getDirectConversation(friend, req)
    }

    @Delete(':id')
    deleteChannel(@Param('id', ParseIntPipe) channel_id: number, @Req() req: Request) {
        return this.chatService.deleteChannel(channel_id, req)
    }

    // ROUTES FOR SOCKET

    // add remove an admin

    // '' '' mute

    // '' '' ban

    // 

    // @Get('/available:id')
    // getAvailables(@Param('id', ParseIntPipe) userId) {
    //     return this.chatService.getAvailables(userId)
    // }

    // @Get('/joined:id')
    // getJoined(@Param('id', ParseIntPipe) userId) {
    //     return this.chatService.getJoined(userId)
    // }
}
