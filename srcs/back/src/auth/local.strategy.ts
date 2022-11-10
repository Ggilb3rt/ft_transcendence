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
            clientID: process.env.AUTH_UID, 
            clientSecret: process.env.AUTH_SECRET,
            callbackURL: process.env.REDIRECT_URI
        })
    }

    async validate(accessToken, refreshToken, profile: Profile): Promise<CreateUserDto> {
    
        if (!profile) {
            throw new HttpException("No 42 user", HttpStatus.NOT_FOUND)
        }

        const nick_fourtytwo = profile.username;
        const first_name = profile.name.givenName;
        const last_name = profile.name.familyName;
        
        const user: CreateUserDto = {
            nick_fourtytwo,
            ranking: 0,
            wins: 0,
            loses: 0,
            two_factor_auth: false
        }

        const ret = await prisma.users.findFirst({
            where: {nick_fourtytwo: profile.username}
        })

        if (!ret) {
            return await this.usersService.postOneUser(user)
        }
        return (ret)
    }
}