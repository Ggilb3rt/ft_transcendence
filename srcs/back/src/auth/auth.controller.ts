import { Controller, Query, Get, Redirect, UseGuards, Req, Res } from '@nestjs/common';
var passport = require('passport');
import OAuth2Strategy from 'passport-oauth2';
import { FourtyTwoGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { FourtyTwoStrategy } from './local.strategy';



@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {
    }

  @Get()
  @UseGuards(FourtyTwoGuard)
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(FourtyTwoGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    // For now, we'll just show the user object
    console.log('req == \n', req);
    return req;
  }
    // @Get()
    // @UseGuards(FourtyTwoStrategy)
    // async authRedirect {
    
    // }

    // @Get('redirect')
    // @UseGuards(FourtyTwoStrategy){

    // }
    // auth() {
    //     return (this.authService.authenticate());
    // }
}
