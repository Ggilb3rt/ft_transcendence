import { Body, Controller, Get, Post, Param, ParseIntPipe, UseGuards, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseInterceptors, Header, StreamableFile, ParseBoolPipe, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './createUserDto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { ban_users, friends, users } from '@prisma/client';
import { otherFormat, userFront, userRestrict } from './types';


@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body('userBDD') user: CreateUserDto): Promise<users> {
       return (this.usersService.postOneUser(user));
    }

    @Get()
    async getAllUsers(): Promise<users[]> {
       return (this.usersService.getAllUsers())
    }

    @Get('/restrict')
    @UseGuards(JwtAuthGuard)
    getUsersRestrict(): Promise<userRestrict[]> {
       return (this.usersService.getUsersRestrict())
    }

    @Get(':id/other')
    @UseGuards(JwtAuthGuard)
    getOther(@Param('id', ParseIntPipe) id): Promise<otherFormat> {
       return (this.usersService.getOtherUser(id))
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getOneUser(@Param('id', ParseIntPipe) id): Promise<userFront> {
        return (this.usersService.getUserById(id))
    }

    @Get(':id/friends')
    @UseGuards(JwtAuthGuard)
    getFriends(@Param('id', ParseIntPipe) id): Promise<number[]> {
        return (this.usersService.getFriends(id));
    }

    @Get(':id/pending')
    @UseGuards(JwtAuthGuard)
    getPending(@Param('id', ParseIntPipe) id): Promise<number[]> {
        return (this.usersService.getPending(id));
    }

    @Post(':id/pending')
    @UseGuards(JwtAuthGuard)
    acceptPending(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend, @Body('valid', ParseBoolPipe) valid): Promise<friends> {
       return (this.usersService.acceptFriend(id, friend, valid))
    }

    @Post(':id/2fa')
    @UseGuards(JwtAuthGuard)
    async switch2fa(@Param('id', ParseIntPipe) id, @Body('status', ParseBoolPipe) status, @Body('code') code: string | undefined, @Res() response) {
        console.log("bounjouern sdf", status)
        let isCodeValid: boolean = false
        if (code)
            isCodeValid = await this.usersService.isCodeValid(code, id)
        console.log("code ", code, "\nisCodeValid ", isCodeValid, "\nstatus ", status)
        console.log("\n--------\ntype of isCodevalid ", typeof isCodeValid, "\ntypeof status ", typeof status)
        if (status == false && isCodeValid == false) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        return (this.usersService.switch2fa(id, status, response))
    }

    @Post(':id/friends')
    @UseGuards(JwtAuthGuard)
    addFriend(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend): Promise<friends> {
       return (this.usersService.addFriend(id, friend))
    }

    @Post(':id/friends/remove')
    @UseGuards(JwtAuthGuard)
    removeFriend(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend) {
       return (this.usersService.removeFriend(id, friend))
    }

    @Post(':id/ban/remove')
    @UseGuards(JwtAuthGuard)
    unBan(@Param('id', ParseIntPipe) id, @Body('ban', ParseIntPipe) ban) {
       return (this.usersService.unBan(id, ban))
    }

    @Get(':id/ban')
    @UseGuards(JwtAuthGuard)
    getBanned(@Param('id', ParseIntPipe) id): Promise<number[]> {
        return (this.usersService.getBannedUsers(id));
    }

    @Get(':id/banned')
    @UseGuards(JwtAuthGuard)
    getBannedMe(@Param('id', ParseIntPipe) id): Promise<number[]> {
        return (this.usersService.getBannedMe(id));
    }

    @Post(':id/ban')
    @UseGuards(JwtAuthGuard)
    banUser(@Param('id', ParseIntPipe) id, @Body('banned', ParseIntPipe) banned): Promise<ban_users> {
        return (this.usersService.banUser(id, banned));
    }

    @Post(':id/nick')
    @UseGuards(JwtAuthGuard)
    changeNickname(@Param('id', ParseIntPipe) id, @Body('nickname') nick: string): Promise<users> {
        return (this.usersService.changeNickname(id, nick))
    }

    @Post(':id/avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    uploadAvatar(@UploadedFile(
        new ParseFilePipe({
            validators: [
                // new MaxFileSizeValidator({ maxSize: 10000}),
                new FileTypeValidator({fileType:'jpeg'})
            ]
        })
    ) file: Express.Multer.File, @Param('id', ParseIntPipe) id, @Body() req): Promise<string> {
        return (this.usersService.changeAvatar(id, file));
    }

    @Get(':id/avatar')
    @UseGuards(JwtAuthGuard)
    @Header('Content-Type', 'image/jpeg')
    @Header('Content-Disposition', 'attachment; filename="your_avatar.jpeg"')
    async getAvatar(@Param('id', ParseIntPipe) id): Promise<StreamableFile> {
        const file = createReadStream(await this.usersService.getAvatar(id))
        return new StreamableFile(file);
    }
}
