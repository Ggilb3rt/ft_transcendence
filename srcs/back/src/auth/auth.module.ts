import { Module } from '@nestjs/common';
import { JwtAuthModule } from 'src/jwt-auth/jwt-auth.module';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FourtyTwoStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, JwtAuthModule],
  providers: [AuthService, UsersService, FourtyTwoStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
