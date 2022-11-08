import { Injectable } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { PrismaClient, users } from "@prisma/client";
import { CreateUserDto } from "./createUserDto";
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
        throw new Error(e)
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
        throw new Error(e)
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
        throw new Error(e)
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
        throw new Error(e)
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
        throw new Error(e)
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
        throw new Error(e)
      }
    }

    async unBan(ban) {
      try {
        await prisma.ban_users.delete({where:{id:ban.id}})
      } catch (e) {
        throw new Error(e)
      }
    }

    async unFriend(friendship) {

      try {
        await prisma.friends.delete({where:{id: friendship.id}})
      } catch (e) {
        throw new Error(e)
      }
    }

    async testNickname(nickname: string) {

      try {
        var regex = /^([0-9]|[a-z])+([0-9a-z])$/i;
        if (nickname.length >= 10) {
          nickname = nickname.slice(0, 10);
        }
        if (!nickname.match(regex)) {
          throw new HttpException("Only alphanumeric characters", HttpStatus.NOT_ACCEPTABLE)
        }
        const test = await prisma.users.findUnique({where:{nickname}})
        //console.log("test == ", test)
        if (test) {
          throw new HttpException("nickname already taken", HttpStatus.CONFLICT);
        }
      } catch (e) {
        //console.log("catch == ", e);
        throw new Error(e)
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
        // console.log("friends == ", friends)
        return (friends)
      } catch (e) {
        throw new Error(e)
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
        throw new Error(e)
      }
    }

	async addMatch(match) {
		await prisma.match.create({
			data: match
		})
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
        throw new Error(e)
      }
    }

    async changeAvatarUrl(id: number, dest: string) {
      try {
        const user = await prisma.users.update({
          where: {id},
          data:{
            avatar_url: dest
          }
        })
        return (user)
      }
      catch (e) {
        throw new Error(e)
      }
    }

    async postOneUser(user: CreateUserDto): Promise<users> {
      try {
        await this.testNickname(user.nickname);
        const existsAlready = await prisma.users.findFirst({where:{nick_fourtytwo: user.nick_fourtytwo}})
        if (existsAlready) {
          throw new HttpException("42 account already binded to a user", HttpStatus.CONFLICT)
        }
        const ret = await prisma.users.create( {data: user })
        return ret;
      } catch (e) {
        throw new Error(e)
      }
    }

    async setSecret(id: number, secret: string) {
      try {
        const user = await this.getUser(id);
  
        await prisma.users.update({where:{id}, data:{
          two_factor_secret: secret
        }})
      } catch (e) {
        throw new Error(e)
      }
    }

    async getUsersRestrict(): Promise<userRestrict[]> {
      const users = await prisma.users.findMany({select:{
        id:true,
        nickname:true,
        avatar_url:true
      }})
      return (users);
    }
}

export {UsersHelper}