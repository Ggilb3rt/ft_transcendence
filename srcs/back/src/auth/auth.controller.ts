import { Controller, Get, UseGuards, Req, Res, Post, HttpCode, Body, UnauthorizedException } from '@nestjs/common';
import { FourtyTwoGuard } from './auth.guard';
import { Request, Response } from 'express';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { AuthService } from './auth.service';
import { TwoFactorGuard } from './two-factor.guard';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';
import { users } from '@prisma/client';


@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService, private jwtAuthService: JwtAuthService, private usersService: UsersService) {
    }

    @Post('/2fa')
    @HttpCode(200)
    @UseGuards(TwoFactorGuard)
    async authenticate(@Req() req, @Body('code') code: string, @Res() res: Response) {
      console.log("debut 2fa; code: ", code)
      console.log("validate == ", await this.jwtAuthService.validate(req.cookies.jwt).validate)
      let {id, username} = await this.jwtAuthService.validate(req.cookies.jwt).validate
      console.log("id and username valides ", id, username)
      // const isCodeValid = await this.usersService.isCodeValid(code, id)
      // console.log("code is valide ?", code, isCodeValid)
      // if (!isCodeValid) {
      //   throw new UnauthorizedException('Wrong authentication code');
      // }
      const { accessToken } = await this.jwtAuthService.login({id, username}, true)
      const expires = new Date(Date.now() + process.env.JWT_EXPIRES_IN)
      res.cookie("jwt", accessToken, {
        httpOnly:true
      });
      return res.send({status:200, msg: true})
    }

  @Get()
  @UseGuards(FourtyTwoGuard)
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @HttpCode(200)
   @UseGuards(FourtyTwoGuard)
  async googleAuthRedirect(@Req() req: Request, @Res({passthrough: true}) res: Response) {

    const { accessToken, two_factor_auth } = await this.jwtAuthService.login(req.user);
    res.cookie('jwt', accessToken, {
      httpOnly:true,
    })
    if (two_factor_auth == false) {
      return res.redirect(process.env.FRONT_URL) // a la base c'est URL_LOGIN_SUCCESS
    }
    else
      return res.redirect(process.env.URL_LOGIN_2FA)
  }

  @Get('verify')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async verif(@Req() req): Promise<users> {
    return (this.authService.verify(req.cookies.jwt))
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    res.clearCookie('jwt')
  }
}
