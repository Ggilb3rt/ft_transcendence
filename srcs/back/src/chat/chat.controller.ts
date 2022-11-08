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
    getChannels(@Req() req: Request) {
        return this.chatService.getAvailableChannels(req)
    }

    @Get(':id')
    getChannel(@Param('id', ParseIntPipe) channel_id: number, @Req() req: Request) {
        return this.chatService.getChannel(channel_id, req)
    }

    @Post()
    createChannel(@Body('channel') channel: TChannel) {
        return this.chatService.createChannel(channel)
    }

    @Post(':id/ban')
    banUser(@Body('banned', ParseIntPipe) banned: number, @Body('expires') expires, @Body('channel_id', ParseIntPipe) channel_id: number, @Req() req: Request) {
        return this.chatService.banUser(channel_id, banned, expires, req)
    }

    @Post(':id/promote')
    promoteUser(@Body('promoted', ParseIntPipe) id: number, @Body('channel_id', ParseIntPipe) channel_id: number, @Req() req: Request) {
        return this.chatService.promoteAdmin(id, channel_id, req);
    }

    @Delete(':id/kick')
    unAdmin(@Body('kicked', ParseIntPipe) id: number, @Body('channel_id', ParseIntPipe) channel_id: number, @Req() req: Request) {
        return this.chatService.kickUser(id, channel_id, req)
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
