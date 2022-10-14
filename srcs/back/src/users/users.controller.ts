import { Body, Controller, Get, Post, Param, ParseIntPipe, UseGuards, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseInterceptors, Header, StreamableFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './createUserDto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';


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
    // @UseGuards(JwtAuthGuard)
    async getOneUser(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getUserById(id))
    }

    @Get(':id/friends')
    // @UseGuards(JwtAuthGuard)
    getFriends(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getFriends(id));
    }

    @Get(':id/pending')
    // @UseGuards(JwtAuthGuard)
    getPending(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getPending(id));
    }

    @Post(':id/pending')
    // @UseGuards(JwtAuthGuard)
    acceptPending(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend) {
       return (this.usersService.acceptFriend(id, friend))
    }

    @Post(':id/friends')
    // @UseGuards(JwtAuthGuard)
    addFriend(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend) {
        console.log("je suis laaa")
       return (this.usersService.addFriend(id, friend))
    }

    @Post(':id/friends/remove')
    // @UseGuards(JwtAuthGuard)
    removeFriend(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend) {
       return (this.usersService.removeFriend(id, friend))
    }

    @Get(':id/ban')
    // @UseGuards(JwtAuthGuard)
    getBanned(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getBannedUsers(id));
    }

    @Get(':id/banned')
    // @UseGuards(JwtAuthGuard)
    getBannedMe(@Param('id', ParseIntPipe) id) {
        return (this.usersService.getBannedMe(id));
    }

    @Post(':id/ban')
    // @UseGuards(JwtAuthGuard)
    banUser(@Param('id', ParseIntPipe) id, @Body('banned', ParseIntPipe) banned) {
        return (this.usersService.banUser(id, banned));
    }

    @Post(':id/nick')
    // @UseGuards(JwtAuthGuard)
    changeNickname(@Param('id', ParseIntPipe) id, @Body('nickname') nick: string) {
        return (this.usersService.changeNickname(id, nick))
    }

    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('file'))
    uploadAvatar(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 10000}),
                new FileTypeValidator({fileType:'jpeg'})
            ]
        })
    ) file: Express.Multer.File, @Param('id', ParseIntPipe) id)
    {
        return (this.usersService.changeAvatar(id, file));
    }

    @Get(':id/avatar')
    @Header('Content-Type', 'image/jpeg')
    @Header('Content-Disposition', 'attachment; filename="your_avatar.jpeg"')
    async getAvatar(@Param('id', ParseIntPipe) id) {
        const file = createReadStream(await this.usersService.getAvatar(id))
        return new StreamableFile(file);
    }
}
