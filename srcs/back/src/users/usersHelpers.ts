import { Injectable } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { PrismaClient, users } from "@prisma/client";
import { CreateUserDto } from "./createUserDto";
import { CreateMatchDto } from "./createMatchDto";
import { userRestrict } from "./types";

const prisma = new PrismaClient();


interface userRelation {
  id: Number
}

interface banRelation {
  banned_id: Number
}

function convertBanList(list:banRelation[]) {
  const newList = []

  if (list)
  for (const obj in list) {
    newList.push(list[obj].banned_id)
  }
  return newList
}

function convertUserList(list:userRelation[]) {
  const newList = []

  if (list)
  for (const obj in list) {
    newList.push(list[obj].id)
  }
  return newList
}

@Injectable()
class UsersHelper {
    formatFriends(friends, id): number[] {
        var arr: number[] = [];
        friends.forEach((friend) => {
          if (friend.friend_id == id) {
            arr.push(friend.user_id)
          }
          else
            arr.push(friend.friend_id)
        })
        return (arr)
    }

    formatBans(bans, id) {
      var arr: number[] = [];
      bans.forEach((ban) => {
        if (ban.banned_id == id) {
          arr.push(ban.user_id)
        }
        else
          arr.push(ban.banned_id)
      })
      return (arr)
  }

    formatUserById(user) {
      user.friends = convertUserList(user.friends)
      user.ban_users_ban_users_idTousers = convertBanList(user.ban_users_ban_users_idTousers)
      return (user);
    }

    checkSame(id: number, requestedId: number) {
      if (id == requestedId) {
        throw new HttpException("requester and requested ID are the same ", HttpStatus.NOT_ACCEPTABLE)
      }
    }


    async getBan(id: number, ban: number) {

      try {
        return (await prisma.ban_users.findFirst({
          where:{
            OR: [
              {
                user_id:id,
                banned_id:ban
              },
              {
                user_id:ban,
                banned_id:id
              }
            ]
          }
        }))
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async getBans(id: number) {
      try {
        return (await prisma.ban_users.findMany({
          where:{
            user_id:id
          }
        }))
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async getBanned(id: number) {
      try {
        return (await prisma.ban_users.findMany({
          where: {
            banned_id: id
          }
        }))
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async getFriendship(id: number, friend: number) {
      try {
        return (await prisma.friends.findFirst({
          where:{
            OR: [
              {
                user_id:id,
                friend_id:friend
              },
              {
                user_id:friend,
                friend_id:id
              }
            ]
          }
        }))
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async getFriendships(id: number) {
      try {
        return (await prisma.friends.findMany({
          where:{
            OR: [
              {
                user_id:id,
              },
              {
                friend_id:id
              }
            ]
          }
        }))
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async getUser(id: number) {
      try {
        const user = await prisma.users.findFirst({where:{id}});
        if (!user) {
          throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }
        return (user);
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async unBan(ban) {
      try {
        await prisma.ban_users.delete({where:{id:ban.id}})
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async unFriend(friendship) {

      try {
        await prisma.friends.delete({where:{id: friendship.id}})
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async testNickname(nickname: string) {

      try {
        var regex = /([ `{})(\]\[="':;.,/\\])/g;
        if (nickname.length >= 10) {
          nickname = nickname.slice(0, 10);
        }
        if (nickname.match(regex)) {
          
          return false
        }
        const test = await prisma.users.findUnique({where:{nickname}})
        //
        if (test) {
          
          return false
        }
        
        return true
      } catch (e) {
        //
        throw new HttpException(e, 401)
      }
    }

    async getPending(id: number) {
      try {
        const friends = await prisma.friends.findMany({
          where: {
            friend_id:id,
            status: false
          }
        })
        
        return (friends)
      } catch (e) {
        throw new HttpException(e, 401)
      }

    }

    async getFriends(id:number) {
      try {
        const friends = await prisma.friends.findMany({
          where:{
            OR: [
              {
                user_id:id,
              },
              {
                friend_id:id
              }
            ],
            status: true
          }
        })
        return (friends)
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

	async addMatch(match: CreateMatchDto, winner: number, loser: number) {
        try {
            await prisma.match.create({ data: match })

            await prisma.users.update({
                where: {id: winner},
                data: {
                    wins: {increment: 1}
                }
            })
            await prisma.users.update({
                where: {id: loser},
                data: {
                    loses: {increment: 1}
                }
            })
        } catch(e) {
            throw new HttpException(e, 401)
        }
	}
	
    async getMatches(id: number) {
      try {
        const matches = await prisma.match.findMany({
          where:{
            OR: [
              {
                player_left_id:id
              },
              {
                player_right_id:id
              }
            ]
          },
          orderBy: {
            date: 'desc'
          },
          take: 10
        })
        
        return (matches)
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async postOneUser(user: CreateUserDto): Promise<users> {
      try {
        const existsAlready = await prisma.users.findFirst({where:{nick_fourtytwo: user.nick_fourtytwo}})
        if (existsAlready) {
          throw new HttpException("42 account already binded to a user", HttpStatus.CONFLICT)
        }
        const ret = await prisma.users.create( {data: {
          nick_fourtytwo: user.nick_fourtytwo,
          nickname: user.nickname,
          first_name: user.first_name,
          last_name: user.last_name
        } })
        return ret;
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async setSecret(id: number, secret: string) {
      try {
        const user = await this.getUser(id);
  
        await prisma.users.update({where:{id}, data:{
          two_factor_secret: secret
        }})
      } catch (e) {
        throw new HttpException(e, 401)
      }
    }

    async getUsersRestrict(): Promise<userRestrict[]> {
      const users = await prisma.users.findMany({select:{
        id:true,
        nickname:true,
      }})
      return (users);
    }
}

export {UsersHelper}