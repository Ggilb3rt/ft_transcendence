import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient();

@Injectable()
class UsersService {
    async getAllUsers() {
        return (await prisma.users.findMany());
    }
    async postOneUser(user) {
        prisma.users.create( {data: user })
    }
}

export {UsersService};