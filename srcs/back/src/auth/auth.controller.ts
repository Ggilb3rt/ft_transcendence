import { Controller, Query, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}

    @Get()
    auth(@Query() query: {code: string}) {
        console.log("\nquery.code ", query.code);
        return (this.authService.getToken(query.code))
    }
}
