import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FourtyTwoStrategy } from './local.strategy';

@Module({
  imports: [UsersModule],
  providers: [AuthService, UsersService, FourtyTwoStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
