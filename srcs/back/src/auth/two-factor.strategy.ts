import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtPayload } from 'src/jwt-auth/jwt-auth.strategy';

const prisma = new PrismaClient();


@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'TwoFactorStrategy') {
  constructor() {
    const extractJwtFromCookie = (req) => {
        let token = null;
  
        if (req && req.cookies) {
          token = req.cookies['jwt'];
          console.log(token)
        }
        return token;
      };
    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate( payload: JwtPayload) {

  console.log(payload);
  const {username, id} = payload;

  const user = await prisma.users.findFirst({where:{id}})
  // console.log("user == ", user)
  if (!user)
    throw new HttpException("Invalid Token Here", HttpStatus.FORBIDDEN)
  return { id, username };
  }
}