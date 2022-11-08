import { Module } from '@nestjs/common';
import { JwtAuthModule } from 'src/jwt-auth/jwt-auth.module';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { JwtAuthStrategy } from 'src/jwt-auth/jwt-auth.strategy';
import { ChatController } from './chat.controller';
import { ChatHelper } from './chat.helper';
import { ChatService } from './chat.service';

@Module({
  imports: [JwtAuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatHelper, JwtAuthService, JwtAuthStrategy],
  exports: [ChatHelper, ChatService],
})
export class ChatModule {}
