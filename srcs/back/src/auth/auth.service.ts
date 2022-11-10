import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { JwtPayload } from 'src/jwt-auth/jwt-auth.strategy';

@Injectable()
export class AuthService {
    constructor(private jwtAuthService: JwtAuthService) {}

    async verify(token: string | null) {
        if (!token) {
          console.log("je n'ai pas de cookie")
            return {status: 2}
          }
        const {validate} = await this.jwtAuthService.validate(token);
        if (!validate || !validate.id) {
          throw new ForbiddenException("Invalid Token")
        }
        if (validate.isAuth || !validate.two_factor_auth) {
          return {status: 0}
        }
        return {status: 1}
    }
}
