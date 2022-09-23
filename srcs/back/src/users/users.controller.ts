import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaClient, Prisma } from '@prisma/client';


@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    create(@Body('userBDD') user: Prisma.usersSelect) {
        console.log("Body == ", user);
       return (this.usersService.postOneUser(user));
    }

    @Get()
    getAllUsers() {
       return (this.usersService.getAllUsers())
    }

    @Get(':id')
    getOneUser(@Param() param) {
        console.log("user id: " + param.id)
        return (this.usersService.getUserById(parseInt(param.id)))
    }

}
