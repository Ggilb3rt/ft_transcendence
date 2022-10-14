import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async generate2faSecret(id: number) {
        const user = await this.usersService.getUserById(id);
        // const secret = authenticator
    }
}
