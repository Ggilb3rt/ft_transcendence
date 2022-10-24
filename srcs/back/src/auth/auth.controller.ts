import { Controller, Get, UseGuards, Req, Res, Post, HttpCode, Body, UnauthorizedException, ConsoleLogger} from '@nestjs/common';
import { FourtyTwoGuard } from './auth.guard';
import { Request, Response } from 'express';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { AuthService } from './auth.service';
import { TwoFactorGuard } from './two-factor.guard';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { ExtractJwt } from 'passport-jwt';
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
      console.log("\n\naccess token == ", accessToken, "\n\n")
      console.log("\n\nvalidate == ", this.jwtAuthService.validate(accessToken), "\n\n")
      res.cookie('jwt', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
      });
      res.redirect('http://localhost:5173')
      return req.user;
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
    console.log("\n\naccess token == ", accessToken, "\n\n")
    console.log("\n\nredirect validate == ", this.jwtAuthService.validate(accessToken), "\n\n")
    res.cookie('jwt', accessToken, {
      // httpOnly: true,
      sameSite: 'lax',
    });
    if (two_factor_auth == false) {
      return res.status(200).redirect('http://localhost:5173')
      // devrait return la meme chose que authenticate
    }
    return res.status(404).redirect('http://localhost:5173')
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
    console.log("l'id qui est validate", id)
    return (this.usersService.getUserById(id));
  }

}
