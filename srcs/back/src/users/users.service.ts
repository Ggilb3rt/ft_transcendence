import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

@Injectable()
class UsersService {
    async getAllUsers() {
        prisma.users.findMany()
        .then((users) => {
          console.log("youpi ", users);
          return (users);
        })
        .catch((reason) => {
          console.log("error occured: ", reason);
          return (reason);
        })
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