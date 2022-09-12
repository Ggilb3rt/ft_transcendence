import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaClient, Prisma } from '@prisma/client';
import { timingSafeEqual } from 'crypto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async create(@Body() user: Prisma.usersSelect) {
        this.usersService.postOneUser(user);
    }

    @Get()
    async getAllUsers() {
        this.usersService.getAllUsers()
    }

}
