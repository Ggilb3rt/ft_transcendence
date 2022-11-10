import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { UsersHelper } from '../users/usersHelpers';

@Module({
  providers: [GameGateway, GameService, UsersHelper],
})
export class GameModule {}
