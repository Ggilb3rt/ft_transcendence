import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersHelper } from './usersHelpers';
import { MulterModule } from '@nestjs/platform-express';

@Module({
    imports: [
      MulterModule.register({
        dest: '/resources',
      })
    ],
    providers: [UsersService, UsersHelper],
    controllers: [UsersController],
    exports: [UsersHelper, UsersService]
  })
export class UsersModule {}
