import { Module } from '@nestjs/common';
import { JwtAuthModule } from 'src/jwt-auth/jwt-auth.module';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FourtyTwoStrategy } from './local.strategy';
import { TwoFactorStrategy } from './two-factor.strategy';

@Module({
  imports: [UsersModule, JwtAuthModule],
  providers: [AuthService, FourtyTwoStrategy, TwoFactorStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
