import { Controller, Get, UseGuards, Req, Res, Post, HttpCode, Body, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { FourtyTwoGuard } from './auth.guard';
import { Request, Response } from 'express';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { AuthService } from './auth.service';
import { TwoFactorGuard } from './two-factor.guard';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService, private jwtAuthService: JwtAuthService, private usersService: UsersService) {
    }

    @Post('/2fa')
    @HttpCode(200)
    @UseGuards(TwoFactorGuard)
    async authenticate(@Req() req, @Body('code') code: string, @Res() res: Response) {

      let {id, username} = await this.jwtAuthService.validate(req.cookies.jwt).validate
      const isCodeValid = await this.usersService.isCodeValid(code, id)
      // 
      if (!isCodeValid) {
        res.status(HttpStatus.FORBIDDEN).send({status: HttpStatus.FORBIDDEN, msg: "Wrong code"});
        // 
      }
      else {
        const { accessToken } = await this.jwtAuthService.login({id, username}, true)
        const expires = new Date(Date.now() + process.env.JWT_EXPIRES_IN)
        res.cookie("jwt", accessToken, {
          httpOnly:true
        });
        res.send({status:200, msg: true})
      }
    }

  @Get()
  @UseGuards(FourtyTwoGuard)
  async auth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @HttpCode(200)
   @UseGuards(FourtyTwoGuard)
  async authRedirect(@Req() req: Request, @Res({passthrough: true}) res: Response) {

    try {
      const { accessToken, two_factor_auth } = await this.jwtAuthService.login(req.user);
      res.cookie('jwt', accessToken, {
        httpOnly:true,
      })
      if (two_factor_auth == false) {
        return res.redirect(process.env.FRONT_URL) // a la base c'est URL_LOGIN_SUCCESS
      }
      else
        return res.redirect(process.env.URL_LOGIN_2FA)
    } catch {
      res.clearCookie('jwt')
      res.send({status: 2})
    }
  }

  @Get('first')
  @UseGuards(JwtAuthGuard)
  async secondTime (@Req() req, @Res({passthrough: true}) res: Response) {
    await this.authService.secondTime(req.cookies.jwt)
    const {id, username} = await this.jwtAuthService.validate(req.cookies.jwt).validate
    const { accessToken } = await this.jwtAuthService.login({id, username}, false);

    res.cookie("jwt", accessToken, {
      httpOnly:true
    });

    return {status:200, msg: true}
  }

  @Get('verify')
  @HttpCode(200)
  async verif(@Req() req, @Res() res) {
    try {
      res.send(await this.authService.verify(req.cookies.jwt))
    } catch {
      res.clearCookie('jwt')
      res.send({status: 2, test: "YOOOOLOOO"})
    }
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('jwt')
    res.send({statusCode: 200, message: 'Bye !!'})
  }
}
