import { Injectable } from '@nestjs/common';
import { ChatHelper } from './chat.helper';

@Injectable()
export class ChatService {
    constructor(private chatHelper: ChatHelper) {}

    async getChannel(channel_id: number) {
        return this.chatHelper.formatChannels(channel_id)
    }
}
