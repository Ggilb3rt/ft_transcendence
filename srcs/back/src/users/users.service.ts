import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

  const prisma = new PrismaClient();

@Injectable()
class UsersService {
  
  async getBannedUsers(id: number) {
    try {
      const banned = await prisma.users.findUnique({
        where: {id},
        select: {
          ban_users_ban_users_banned_idTousers: {
            select: {
              id: true,
              
            }
          }
        }
      })
    } catch (err) {
      console.log("err: ", err);
    }
  }

  async getUserById(id: number) {
      try {
        const user = await prisma.users.findFirst({
          where: {
            id: id
          }
        })
        return (user);
      } catch (err) {
        throw new HttpException('No User at this id', 404);
      }
    }

    async getFriends(id: number) {
      try {
        const friends = await prisma.users.findUnique({
          where:{id},
          select: {
            friends: {
              select: {
                id: true,
                avatar_url: true,
                nickname: true
              }
            }
          }
        });
        return (friends)
      } catch (err) {
        throw new HttpException('No User at this id', 404);
      }
    }

    async addFriend(id: number, friend: number) {
      try {
        if (id == friend) {
          throw("Can't be friend with yourself");
        }
        const user = await prisma.users.findUnique({
          where: {
            id: id
          } 
        })
        console.log ("id [", id, `] && friend [${Number(friend)}]`);
        const user_friend = await prisma.users.findUnique({where:{id: friend}});
        if (user && user_friend) {
          await prisma.$transaction([
          prisma.users.update({
            where: {id},
            data: {
              friends: {
                connect: {
                  id: friend
                }
              },
            },
          }),
          prisma.users.update({
            where: {id: friend},
            data: {
              friends: {
                connect: {
                  id
                }
              }
            }
          })])
        }
        const result = await prisma.users.findUnique({where:{id},select:{friends:true}});
        console.log("has it worked? ===> ", result);
        return (user_friend);
      } catch (err) {
        console.log(err);
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
        console.log("user = ", user);
        const res = await prisma.users.create( {data: user })
        return (res);
      } catch (err) {
        console.log("err :", err);
      }
    }

}

export {UsersService};