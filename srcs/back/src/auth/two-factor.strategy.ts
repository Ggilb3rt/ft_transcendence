import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtPayload } from 'src/jwt-auth/jwt-auth.strategy';

const prisma = new PrismaClient();


@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'TwoFactorStrategy') {
  constructor() {
    const extractJwtFromCookie = () => {
    };

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true
    });
    extractJwtFromCookie();
  }

  async validate(req, payload: JwtPayload) {

//   console.log(payload);
  const {username, id} = payload;

  const user = await prisma.users.findFirst({where:{id}})
  console.log("user == ", user)
  if (!user || (req.params.id != id))
    throw new HttpException("Invalid Token", HttpStatus.FORBIDDEN)
  return { id, username };
  }
}