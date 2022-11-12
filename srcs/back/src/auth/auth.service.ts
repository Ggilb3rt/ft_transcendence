import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@Injectable()
export class AuthService {
    constructor(private jwtAuthService: JwtAuthService) {}

    async verify(token: string | null) {
        if (!token) {
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
