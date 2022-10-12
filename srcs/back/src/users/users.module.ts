import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersHelper } from './usersHelpers';

@Module({
    imports: [],
    providers: [UsersService, UsersHelper],
    controllers: [UsersController],
    exports: [UsersHelper, UsersService]
  })
export class UsersModule {}
