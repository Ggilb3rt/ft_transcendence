import { Body, Controller, Post, Get, Redirect } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { LoginService } from './login.service';
import getCredentials from "./login.strategy"

@Controller('login')
export class LoginController {
    constructor(private loginService: LoginService) {}
    @Get()
    @Redirect(process.env.BASE_URL_GET)
    buildUrl(){
        const args = {
            id: process.env.AUTH_UID,
            redir: process.env.REDIRECT_URI,
            r_t: "code",
            scope: "public",
            state: process.env.STATE
        }
        const url = `${process.env.BASE_URL_GET}?client_id=${process.env.AUTH_UID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=public&state=${process.env.STATE}`
        return {url: url};
    }
}
