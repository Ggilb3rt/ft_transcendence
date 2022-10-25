import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtAuthService: JwtAuthService) {}

    async verify(token: string | null) {
        if (!token) {
            throw new UnauthorizedException({msg: "Missing token"})
          }
        const {id} = await this.jwtAuthService.validate(token).validate;
        if (!id) {
          throw new UnauthorizedException({msg: "Invalid Token"})
        }
        return (this.usersService.getUserById(id));
    }
}
