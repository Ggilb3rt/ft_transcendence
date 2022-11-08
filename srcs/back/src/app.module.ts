import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';
import { UsersStatusGateway } from './usersStatus/usersStatus.gateway';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { JwtAuthModule } from './jwt-auth/jwt-auth.module';
import { testStatusGateway } from './testStatus/testStatus.gateway'
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ UsersModule, AuthModule, GameModule, JwtAuthModule, ChatModule ],
  controllers: [AppController, UsersController, AuthController, GameController],
  providers: [AppService, UsersService, AuthService, UsersStatusGateway, testStatusGateway, GameService, /*ChatGateway*/],
})
export class AppModule {}
