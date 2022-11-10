import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type JwtPayload = { id: number; username: string, isAuth: boolean, two_factor_auth: boolean};

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const extractJwtFromCookie = (req) => {
      let token = null;

      // console.log("extractJwtfromCookie ", req.cookies)
      if (req && req.cookies) {
        token = req.cookies['jwt'];
        // console.log(token)
      }
      return token;
    };

    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true
    });
  }

  async validate(req, payload: JwtPayload) {

  // console.log(payload);
  const { username, id, isAuth } = payload;

  const user = await prisma.users.findFirst({where:{id}})

  console.log("MY user in STRAT == ", user)
  // console.log("params validate", req.params.id)
  if (!user)
    throw new HttpException("Invalid Token", HttpStatus.FORBIDDEN)  
  if (!isAuth && user.two_factor_auth) {
    throw new HttpException("not 2fa secured", HttpStatus.PRECONDITION_FAILED)
  }
  return { id, username };
  }
}