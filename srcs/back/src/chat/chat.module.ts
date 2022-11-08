import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatHelper } from './chat.helper';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, ChatHelper]
})
export class ChatModule {}
