import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-auth.strategy';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  async login(user, isAuth = false) {
    console.log("debut login")
    const {two_factor_auth} = await prisma.users.findFirst({where:{id:user.id},
      select: {
        two_factor_auth:true
      }
    })
    const payload: JwtPayload = { username: user.username, id: user.id, isAuth };
    return {
      accessToken: this.jwtService.sign(payload),
      two_factor_auth,
    };
  }

  validate(token) {
    console.log("token in validate in jwt-auth service", token)
    return {
        validate: this.jwtService.verify(token)
    }
  }
}