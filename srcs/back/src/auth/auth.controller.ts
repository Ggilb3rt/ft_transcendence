import { Controller, Get, UseGuards, Req, Res} from '@nestjs/common';
import { FourtyTwoGuard } from './auth.guard';
import { Request, Response } from 'express';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';


@Controller('auth')
export class AuthController {
    constructor (private jwtAuthService: JwtAuthService) {
    }

  @Get()
  @UseGuards(FourtyTwoGuard)
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(FourtyTwoGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {

    const { accessToken } = this.jwtAuthService.login(req.user);
    console.log("\n\naccess token == ", accessToken, "\n\n")
    console.log("\n\nvalidate == ", this.jwtAuthService.validate(accessToken), "\n\n")
    res.cookie('jwt', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
    res.redirect('http://localhost:5173')
    return req.user;
  }
}
