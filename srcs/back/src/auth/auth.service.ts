import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { UsersService } from 'src/users/users.service';
import { PrismaClient } from '@prisma/client'
var passport = require('passport');

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    authenticate() {
        return ({
            url: `${process.env.FRONT_URL}`,
            statusCode: 200
        })
    }

    getOptions() {
        return ({
            authorizationURL: process.env.BASE_URL_GET,
            tokenURL: process.env.BASE_URL_POST,
            clientID: process.env.AUTH_UID,
            clientSecret: process.env.AUTH_SECRET,
            callbackURL: process.env.FRONT_URL
        })
    }

    async verify(accessToken, refreshToken, user, cb) {
        try {
            console.log("\nCOUCOUCOUCOU\n");
            if (accessToken || refreshToken) {
                var ret = prisma.users.findFirst({
                    where: {nick_fourtytwo: user.nick_fourtytwo}
                })
                if (!user) {
                    console.log("\n\naccessToken || refreshToken == \n", accessToken || refreshToken);
                    this.usersService.postOneUser(user)
                }
            }
        } catch (err) {
            console.log("\nerror during auth:\n", err)
        }
    }

    check (state: string): boolean {
        if (state = process.env.STATE)
            return (true);
        return (false);
    }


    async getToken (code: string) {
        try {
        const arg = {
            grant_type: "authorization_code",
            client_id: process.env.AUTH_UID,
            client_secret: process.env.AUTH_SECRET,
            code,
            redirect_uri: "http://localhost:5173",
        }
        // const url = `${process.env.BASE_URL_POST}?grant_type=authorization_code&client_id=${process.env.AUTH_UID}&client_secret=${process.env.AUTH_SECRET}&code=${code}&redirect_uri=http://localhost:5173`;
        // const res = await axios.post(url);
        const res = await axios({
            method: "post",
            url: "https://api.intra.42.fr/oauth/token",
            data: JSON.stringify(arg),
            headers: {
              "content-type": "application/json",
            },
          });
          
        console.log("\n\n------ RES EN DESSOUS ------\n\n ", res);
    } catch (err) {
        console.log("\n\n------ ERR EN DESSOUS ------\n\n ", err);
    }
    }
}
