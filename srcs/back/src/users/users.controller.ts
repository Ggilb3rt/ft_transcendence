import { Body, Controller, Get, Post, Param, ParseIntPipe, UseGuards, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseInterceptors, Header, StreamableFile, ParseBoolPipe, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './createUserDto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { ban_users, friends, users } from '@prisma/client';
import { otherFormat, userFront, userRestrict } from './types';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService, private jwtAuthService: JwtAuthService) {}

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
    getOther(@Param('id', ParseIntPipe) id: number): Promise<otherFormat> {
       return (this.usersService.getOtherUser(id))
    }

    @Get('/current')
    @UseGuards(JwtAuthGuard)
    async getOneUser(@Req() req): Promise<userFront> {
        const id = await this.usersService.verify(req.cookies.jwt)
        return (this.usersService.getUserById(id))
    }

    @Get(':id/friends')
    @UseGuards(JwtAuthGuard)
    getFriends(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
        return (this.usersService.getFriends(id));
    }

    @Get(':id/pending')
    @UseGuards(JwtAuthGuard)
    getPending(@Param('id', ParseIntPipe) id: number): Promise<number[]> {
        return (this.usersService.getPending(id));
    }

    @Post(':id/pending')
    @UseGuards(JwtAuthGuard)
    acceptPending(@Param('id', ParseIntPipe) id: number, @Body('friend', ParseIntPipe) friend: number, @Body('valid', ParseBoolPipe) valid: boolean): Promise<friends> {
       return (this.usersService.acceptFriend(id, friend, valid))
    }

    @Post(':id/2fa')
    // @UseGuards(JwtAuthGuard)
    async switch2fa(@Param('id', ParseIntPipe) id: number, @Body('status', ParseBoolPipe) status: boolean, @Body('code') code: string, @Res() response) {
        let isCodeValid: boolean = false
        if (code) {
            isCodeValid = await this.usersService.isCodeValid(code, id)
        }
        if (status == false && isCodeValid == false) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        const user = await this.usersService.getUserById(id);
        const {accessToken} = await this.jwtAuthService.login(user, status)

        response.cookie("jwt", accessToken, {
            httpOnly:true
          });

        if (status == true)
            return (this.usersService.switch2fa(id, status, response))
        else return {msg: "disabled"}
    }

    @Post(':id/friends')
    @UseGuards(JwtAuthGuard)
    addFriend(@Param('id', ParseIntPipe) id: number, @Body('friend', ParseIntPipe) friend: number): Promise<friends> {
       return (this.usersService.addFriend(id, friend))
    }

    @Post(':id/friends/remove')
    @UseGuards(JwtAuthGuard)
    removeFriend(@Param('id', ParseIntPipe) id: number, @Body('friend', ParseIntPipe) friend: number) {
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
