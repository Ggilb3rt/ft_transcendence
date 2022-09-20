import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { LoginService } from './login/login.service';
import { LoginController } from './login/login.controller';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { GameModule } from './game/game.module';
import { ChatGateway } from './chat/chat.gateway';



@Module({
  imports: [ UsersModule, LoginModule, RegisterModule, GameModule ],
  controllers: [AppController, UsersController, LoginController],
  providers: [AppService, UsersService, LoginService, ChatGateway],
})
export class AppModule {}
