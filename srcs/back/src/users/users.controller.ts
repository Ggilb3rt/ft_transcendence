import { Body, Controller, Get, Post, Param, ParseIntPipe, UseGuards, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseInterceptors, Header, StreamableFile, ParseBoolPipe, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './createUserDto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import { AuthService } from 'src/auth/auth.service';


@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService, private authService: AuthService) {}

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

    @Post(':id/2fa')
    switch2fa(@Param('id', ParseIntPipe) id, @Body('status', ParseBoolPipe) status, @Body('code') code) {
        const isCodeValid = this.authService.isCodeValid(code, id)
        if (!isCodeValid) {
            throw new UnauthorizedException('Wrong authentication code');
        }
        return (this.usersService.switch2fa(id, status))
    }

    @Get(':id/generate')
    // @UseGuards(JwtAuthGuard)
    async register(@Res() response, @Param('id', ParseIntPipe) id) {
      const { otpauthUrl } = await this.authService.generate2faSecret(id);
   
      return this.authService.pipeQrCodeStream(response, otpauthUrl);
    }



    @Post(':id/friends')
    // @UseGuards(JwtAuthGuard)
    addFriend(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend) {
       return (this.usersService.addFriend(id, friend))
    }

    @Post(':id/friends/remove')
    // @UseGuards(JwtAuthGuard)
    removeFriend(@Param('id', ParseIntPipe) id, @Body('friend', ParseIntPipe) friend) {
       return (this.usersService.removeFriend(id, friend))
    }

    @Post(':id/ban/remove')
    // @UseGuards(JwtAuthGuard)
    unBan(@Param('id', ParseIntPipe) id, @Body('ban', ParseIntPipe) ban) {
       return (this.usersService.unBan(id, ban))
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
    ) file: Express.Multer.File, @Param('id', ParseIntPipe) id, @Body() req)
    {
        console.log("req == ", req.file)
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
