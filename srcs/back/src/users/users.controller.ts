import { Body, Controller, Get, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateUserDto } from './createUserDto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
const prisma = new PrismaClient();


@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    create(@Body('userBDD') user: CreateUserDto) {
       return (this.usersService.postOneUser(user));
    }

    @Get()
    async getAllUsers() {
       return (this.usersService.getAllUsers())
    }

    @Get('/restrict')
    getUsersRestrict() {
       return (this.usersService.getUsersRestrict())
    }
    @Get(':id/other')
    getOther(@Param('id', ParseIntPipe) id) {
       return (this.usersService.getOtherUser(id))
    }

    @Get(':id')
    getOneUser(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getUserById(id))
    }

    @Get(':id/friends')
    // @UseGuards(JwtAuthGuard)
    getFriends(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getFriends(id));
    }

    @Post(':id/friends')
    @UseGuards(JwtAuthGuard)
    addFriend(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend) {
       return (this.usersService.addFriend(id, friend))
    }

    @Get(':id/ban')
    @UseGuards(JwtAuthGuard)
    getBanned(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getBannedUsers(id));
    }

    @Post(':id/ban')
    @UseGuards(JwtAuthGuard)
    banUser(@Param('id', ParseIntPipe) id, @Body('banned', ParseIntPipe) banned) {
        return (this.usersService.banUser(id, banned));
    }

    @Post(':id/nick')
    @UseGuards(JwtAuthGuard)
    changeNickname(@Param('id', ParseIntPipe) id, @Body('nickname') nick: string) {
        return (this.usersService.changeNickname(id, nick))
    }
}
