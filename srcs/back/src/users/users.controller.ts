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

    @Get('/restrict')
    getUsersRestrict() {
       return (this.usersService.getUsersRestrict())
    }
    @Get(':id/other')
    getOther(@Param() param) {
       return (this.usersService.getOtherUser(parseInt(param.id)))
    }

    @Get(':id')
    getOneUser(@Param() param) {
        console.log("user id: " + param.id)
        return (this.usersService.getUserById(parseInt(param.id)))
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

    @Get(':id/ban')
    getBanned(@Param() params) {
        return (this.usersService.getBannedUsers(parseInt(params.id)));
    }

    @Post(':id/ban')
    banUser(@Param() params, @Body() body) {
        return (this.usersService.banUser(parseInt(params.id), body.banned));
    }
}
