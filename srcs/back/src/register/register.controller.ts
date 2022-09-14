import { Body, Controller, Post } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RegisterService } from './register.service';

@Controller('register')
export class RegisterController {
    constructor(private registerService: RegisterService) {}

    @Post()
    create(@Body('userBDD') user: Prisma.usersSelect) {
        console.log("Body == ", user);
       return (this.registerService.registerUser(user));
    }

}
