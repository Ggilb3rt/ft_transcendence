import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma} from '@prisma/client'

const prisma = new PrismaClient();

@Injectable()
class UsersService {
    async getAllUsers() {
        const users = await prisma.users.findMany();
        console.log("users ==> ", users);
        return (users);
    }
    async postOneUser(user) {
        prisma.users.create( {data: user })
        .then((user) => {
          console.log("yaaay welcome: ", user);
          return (user)})
        .catch((reason) => {
          console.log("too bad: ", reason);
          return (reason)});
    }
}

export {UsersService};