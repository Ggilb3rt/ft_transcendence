import { Controller, Get, UseGuards, Req, Res, Post, HttpCode, Body, UnauthorizedException } from '@nestjs/common';
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

    @Post(':id/2fa')
    @HttpCode(200)
    @UseGuards(TwoFactorGuard)
    async authenticate(@Req() req, @Body() body, @Res() res: Response) {
      const {id, code, username} = body;
      const isCodeValid = this.authService.isCodeValid(code, id)
      if (!isCodeValid) {
        throw new UnauthorizedException('Wrong authentication code');
      }
      const { accessToken } = await this.jwtAuthService.login({id, username}, true)
      const exp = new Date(Date.now() + process.env.JWT_EXPIRES_IN)
      res.cookie('jwt', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        expires: exp
      });
      res.redirect(process.env.URL_LOGIN_SUCCESS)
    }

  @Get()
  @UseGuards(FourtyTwoGuard)
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(FourtyTwoGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {

    const { accessToken, two_factor_auth } = await this.jwtAuthService.login(req.user);
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
    if (two_factor_auth == false) {
      return res.redirect(process.env.URL_LOGIN_SUCCESS)
    }
    return res.redirect(process.env.URL_LOGIN_2FA)
  }

  @Get('authenticate')
  @UseGuards(JwtAuthGuard)
  async verif(@Req() req) {
    console.log(req.headers)
    const token = req.headers['authorization'].slice(7)
    // console.log(pouet)
    // console.log("debut de verif de la route authenticate")
    // const token = ExtractJwt.fromAuthHeaderAsBearerToken()
    // console.log("le token dans le header est ", token)
    const {id} = await this.jwtAuthService.validate(token).validate;
    if (!id) {
      throw new UnauthorizedException({msg: "Invalid Token"})
    }
    console.log("l'id qui est validate", id)
    return (this.usersService.getUserById(id));
  }
}
