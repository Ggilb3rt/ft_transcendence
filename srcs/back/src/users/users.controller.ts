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
    getOneUser(@Param() params) {
        return (this.usersService.getUserById(parseInt(params.id)));
    }

    @Get(':id/friends')
    getFriends(@Param() params) {
        return (this.usersService.getFriends(parseInt(params.id)));
    }

    @Post(':id/friends')
    addFriend(@Param() params, @Body() body) {
        console.log("\n\nBody == \n\n", body);
        console.log("\n Params = \n", params);
        return (this.usersService.addFriend(parseInt(params.id), body.friend));
    }
}
