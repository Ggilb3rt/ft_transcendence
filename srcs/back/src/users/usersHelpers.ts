import { Injectable } from "@nestjs/common";
import { HttpException, HttpStatus } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

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
    }

    async getBans(id: number) {

      return (await prisma.ban_users.findMany({
        where:{
          user_id:id
        }
      }))
    }

    async getBanned(id: number) {
      return (await prisma.ban_users.findMany({
        where: {
          banned_id: id
        }
      }))
    }

    async getFriendship(id: number, friend: number) {

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
    }

    async getFriendships(id: number) {

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
    }

    async getUser(id: number) {
      const user = await prisma.users.findFirst({where:{id}});
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND)
      }
      return (user);
    }

    async unBan(ban) {
      await prisma.ban_users.delete({where:{id:ban.id}})
    }

    async unFriend(friendship) {
      await prisma.friends.delete({where:{id: friendship.id}})
    }

    async testNickname(nickname: string) {
      var regex = /^([0-9]|[a-z])+([0-9a-z])$/i;
        if (nickname.length >= 10) {
          nickname = nickname.slice(0, 10);
        }
        if (!nickname.match(regex)) {
          throw new HttpException("Only alphanumeric characters", HttpStatus.NOT_ACCEPTABLE)
        }
        const test = await prisma.users.findFirst({where:{nickname}})
        console.log("test == ", test)
        if (test) {
          throw new HttpException("nickname already taken", HttpStatus.CONFLICT);
        }
    }

    async getPending(id: number) {
      const friends = await prisma.friends.findMany({
        where: {
          friend_id:id,
          status: false
        }
      })
      // console.log("friends == ", friends)
      return (friends)
    }

    async getFriends(id:number) {
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
    }

	async addMatch(match) {
		await prisma.match.create({
			data: match
		})
	}
    async getMatches(id: number) {

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
    }

    async changeAvatarUrl(id: number, dest: string) {
      const user = await prisma.users.update({
        where: {id},
        data:{
          avatar_url: dest
        }
      })
      return (user)
    }
}

export {UsersHelper}