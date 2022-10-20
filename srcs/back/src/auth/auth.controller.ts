import { Controller, Get, UseGuards, Req, Res, Post, HttpCode, Body, UnauthorizedException, ConsoleLogger} from '@nestjs/common';
import { FourtyTwoGuard } from './auth.guard';
import { Request, Response } from 'express';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { TwoFactorGuard } from './two-factor.guard';
import { UsersService } from 'src/users/users.service';


@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService, private jwtAuthService: JwtAuthService, private usersService: UsersService) {
    }

    @Post(':id/2fa')
    @HttpCode(200)
    @UseGuards(TwoFactorGuard)
    async authenticate(@Req() req, @Body() body, @Res() res: Response) {
      console.log("mon token a marché")
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
    console.log("\n\nvalidate == ", this.jwtAuthService.validate(accessToken), "\n\n")
    res.cookie('jwt', accessToken, {
      // httpOnly: true,
      // sameSite: 'lax',
    });
    if (two_factor_auth == false) {
      console.log('\nami here plsss\n', req.user);
      res.redirect('http://localhost:5173')
      return req.user;
    }
    console.log('\nOR\n');
    res.send("Need 2fa")
  }

  @Get('authenticate')
  @UseGuards(JwtAuthGuard)
  async verif(token: string) {
    const {id} = await this.jwtAuthService.validate(token).validate;
    return (this.usersService.getUserById(id));
  }
}
