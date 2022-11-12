import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ChatController } from './chat.controller';
import { ChatHelper } from './chat.helper';
import { ChatService } from './chat.service';

@Module({
  imports: [UsersModule],
  controllers: [ChatController],
  providers: [ChatService, ChatHelper, JwtService],
  exports: [ChatHelper, ChatService],
})
export class ChatModule {}
