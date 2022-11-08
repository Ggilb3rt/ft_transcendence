import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { TChannel } from 'src/users/types';
import { ChatService } from './chat.service';

@Controller('channels')
export class ChatController {
    constructor(private chatService: ChatService) {}

    //
    //Get /chat/id => return channel object

    //get /chat/available/id
    //get /chat/joined/id

    @Get('')
    getChannels(@Body('id') id: number) {
        return this.chatService.getAvailableChannels(id)
    }

    @Get(':id')
    getChannel(@Param('id', ParseIntPipe) channel_id: number, @Req() req: Request) {
        return this.chatService.getChannel(channel_id, req)
    }

    @Post()
    createChannel(@Body('channel') channel: TChannel) {
        return this.chatService.createChannel(channel)
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
