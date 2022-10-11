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
import { UsersStatusGateway } from './usersStatus/usersStatus.gateway';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';



@Module({
  imports: [ UsersModule, LoginModule, RegisterModule, AuthModule, GameModule ],
  controllers: [AppController, UsersController, LoginController, AuthController],
  providers: [AppService, UsersService, LoginService, AuthService, ChatGateway, UsersStatusGateway],
})
export class AppModule {}
