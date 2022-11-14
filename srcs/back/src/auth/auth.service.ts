import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

const prisma = new PrismaClient()

@Injectable()
export class AuthService {
    constructor(private jwtAuthService: JwtAuthService) {}

    async secondTime(token: string | null, res) {
      if (!token) {
        throw new ForbiddenException("Need Token")
      }
      const {validate} = await this.jwtAuthService.validate(token, res);
      let id: number = validate.id
      if (!validate || !validate.id) {
        throw new ForbiddenException("Invalid Token")
      }
      await prisma.users.update({where:{id},
        data: {
          first_connection: false
        }
      })
    }

    async verify(token: string | null, res) {
      console.log("dans verify token = ", token)
        if (!token) {
          console.log("je return")
            return {status: 2}
          }

        const {validate} = this.jwtAuthService.validate(token, res);

        // console.log("VALIDATE === ", validate)
        if (!validate || !validate.id) {
          throw new ForbiddenException("Invalid Token")
        }
        if (validate.first_time == true) {
          return {status: 3}
        }
        if (validate.isAuth || !validate.two_factor_auth) {
          return {status: 0}
        }
        return {status: 1}
    }
}
