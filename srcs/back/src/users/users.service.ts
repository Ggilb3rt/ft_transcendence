import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

@Injectable()
class UsersService {
    async getUserById(id: number) {
      try {
        const user = await prisma.users.findFirst({
          where: {
            id: id
          }
        })
      } catch (err) {
        console.log("err: ", err)
      }
    }

    async getAllUsers() {
      try {
        const users = await prisma.users.findMany()
        return (users);
      } catch (err) {
        console.log("err: ", err)
      }
    }

    async postOneUser(user) {
      try {
        const res = await prisma.users.create( {data: user })
        return (res);
      } catch (err) {
        console.log("err ", err);
      }
    }
}

export {UsersService};