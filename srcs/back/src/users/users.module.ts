import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersHelper } from './usersHelpers';
import { MulterModule } from '@nestjs/platform-express';
import { AuthService } from 'src/auth/auth.service';

@Module({
    imports: [
      MulterModule.register({
        dest: '/resources',
      }),
    ],
    providers: [UsersService, UsersHelper, AuthService],
    controllers: [UsersController],
    exports: [UsersHelper, UsersService]
  })
export class UsersModule {}
