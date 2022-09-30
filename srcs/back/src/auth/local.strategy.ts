import { Strategy } from "passport-oauth2";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { PrismaClient } from '@prisma/client'
import { UsersService } from "src/users/users.service";

  const prisma = new PrismaClient();

@Injectable()
export class FourtyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private usersService: UsersService){
        super({
            authorizationURL: process.env.BASE_URL_GET,
            tokenURL: process.env.BASE_URL_POST,
            clientID: process.env.AUTH_UID,
            clientSecret: process.env.AUTH_SECRET,
            callbackURL: process.env.FRONT_URL
        })
    }

    async verify(accessToken, refreshToken, user, cb) {
        try {
            if (accessToken || refreshToken) {
                var ret = prisma.users.findFirst({
                    where: {nick_fourtytwo: user.nick_fourtytwo}
                })
                if (!ret) {
                    this.usersService.postOneUser(user)
                }
            }
            console.log('\n\n42user == \n', ...user);
            return (user)
        } catch (err) {
            console.log("\nerror during auth:\n", err)
        }
    }
}