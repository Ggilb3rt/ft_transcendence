import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaClient, Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async create(@Body('user') user: Prisma.usersSelect) {
        console.log("Body == ", user);
       return (this.usersService.postOneUser(user));
    }

    @Get()
    async getAllUsers() {
       return (this.usersService.getAllUsers())
    }

}
