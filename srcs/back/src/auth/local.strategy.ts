import OAuth2Strategy, { Strategy } from "passport-oauth2";
// import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import passport from 'passport'
import { PrismaClient } from '@prisma/client'
import { UsersService } from "src/users/users.service";

  const prisma = new PrismaClient();

  // ===> QUAND EST CE QUE CE CODE VA S'EXECUTER
@Injectable()
export class localStrategy {
    constructor(private usersService: UsersService){}
    // passport.use(new OAuth2Strategy({
    // 
    // },
    // function(accessToken, refreshToken, profile, cb) {
    //     const result = prisma.users.findUnique()
    // }))

    getOptions() {
        return ({
            authorizationURL: process.env.BASE_URL_GET,
            tokenURL: process.env.BASE_URL_POST,
            clientID: process.env.AUTH_UID,
            clientSecret: process.env.AUTH_SECRET,
            callbackURL: "http://localhost:5173"
        })
    }

    async validate(accessToken, refreshToken, user, cb) {
        try {
            if (accessToken || refreshToken) {
                var ret = prisma.users.findFirst({
                    where: {nick_fourtytwo: user.nick_fourtytwo}
                })
                if (!user) {
                    this.usersService.postOneUser(user)
                }
            }
        } catch (err) {
            console.log("\nerror during auth:\n", err)
        }
    }
}