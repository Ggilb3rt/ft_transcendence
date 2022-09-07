import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AppService } from './app.service';
import { UsersService } from './services/users/users.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, UsersService],
})
export class AppModule {}
