import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@Injectable()
export class AuthService {
    constructor(private jwtAuthService: JwtAuthService) {}

    async verify(token: string | null): Promise<number> {
        if (!token) {
            return (-1)
          }
        const {validate} = await this.jwtAuthService.validate(token);
        if (!validate.id) {
          throw new ForbiddenException("Invalid Token")
        }
        if (validate.isAuth)
          return 0
        return 1
    }
}
