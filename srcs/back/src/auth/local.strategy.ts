import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-42";
import { PrismaClient } from '@prisma/client'
import { UsersService } from "src/users/users.service";
import { CreateUserDto } from "src/users/createUserDto";

  const prisma = new PrismaClient();

@Injectable()
export class FourtyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private usersService: UsersService){
        super({
            authorizationURL: process.env.BASE_URL_GET,
            tokenURL: process.env.BASE_URL_POST,
            clientID: process.env.AUTH_UID, 
            clientSecret: process.env.AUTH_SECRET,
            callbackURL: "http://localhost:3000/auth/redirect"
        })
    }

    async validate(accessToken, refreshToken, profile: Profile) {
    
        if (!profile) {
            throw new HttpException("No 42 user", HttpStatus.NOT_FOUND)
        }

        const nick_fourtytwo = profile.username;
        const first_name = profile.name.givenName;
        const last_name = profile.name.familyName;
        
        const user: CreateUserDto = {
            nick_fourtytwo,
            first_name,
            last_name,
            nickname: nick_fourtytwo,
            avatar_url: undefined,
            ranking: null,
            wins: null,
            loses: null,
            two_factor_auth: null
        }

        console.log("user == ", user);

        const ret = await prisma.users.findFirst({
            where: {nick_fourtytwo: profile.username}
        })

        if (!ret) {
            const newUser = await this.usersService.postOneUser(user)
            console.log('\n\n42user == \n', newUser);
            return (newUser)
        }
        return (ret)
    }
}