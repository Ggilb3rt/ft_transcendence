import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-auth.strategy';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  async login(user, isAuth = false) {
    // console.log("debut login")
    //console.log("user ", user)
    const {two_factor_auth, nick_fourtytwo, first_connection} = await prisma.users.findFirst({where:{id:user.id},
      select: {
        two_factor_auth:true,
        nick_fourtytwo:true,
        first_connection:true
      }
    })
    const payload: JwtPayload = { username: nick_fourtytwo, id: user.id, isAuth, two_factor_auth, first_time: first_connection };
    // console.log("\n\n--------\n\npayload == ", payload)
    return {
      accessToken: this.jwtService.sign(payload),
      two_factor_auth,
    };
  }

  validate(token, res) {
    // console.log("token in validate in jwt-auth service", token)
    try {
      return {
        validate: this.jwtService.verify(token)
      }
    } catch {
      res.clearCookie('jwt')
      throw new ForbiddenException("JWT malformed")
    }
  }
}