import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService) {}

    //
    //Get /chat/id => return channel object

    //get /chat/available/id
    //get /chat/joined/id

    @Get(':id')
    getChannel(@Param('id', ParseIntPipe) channelId) {
        return this.chatService.getChannel(channelId)
    }

    // @Post()
    // createChannel(@Body('Channel') channel) {
    //     return this.chatService.createChannel(channel)
    // }

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
