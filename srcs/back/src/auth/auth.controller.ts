import { Controller, Query, Get, Redirect } from '@nestjs/common';
var passport = require('passport');
import OAuth2Strategy from 'passport-oauth2';
import { AuthService } from './auth.service';



@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {
    }

    @Get()
    @Redirect('/login', 400)
    auth() {
        return (this.authService.authenticate());
    }
}
