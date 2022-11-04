import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';
import { Module } from '@nestjs/common';
import { JwtAuthStrategy } from './jwt-auth.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN,
          },
        };
      },
    }),
  ],
  providers: [JwtAuthStrategy, JwtAuthService],
  exports: [JwtModule, JwtAuthService],
})
export class JwtAuthModule {}