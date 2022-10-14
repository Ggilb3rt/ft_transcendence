import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type JwtPayload = { sub: number; username: string };

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const extractJwtFromCookie = (req) => {
      let token = null;

      if (req && req.cookies) {
        token = req.cookies['jwt'];
      }
      return token;
    };

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true
    });
  }

  async validate(req, payload: JwtPayload) {

    console.log(payload);
  const {username} = payload;
  const id = payload.sub;

  // console.log("req = ", req.params.id)
  const isGoodOne = await prisma.users.findFirst({where:{id}})
  if (!isGoodOne || (req.params.id != id))
    throw new HttpException("Invalid Token", HttpStatus.FORBIDDEN)
  return { id, username };
  }
}