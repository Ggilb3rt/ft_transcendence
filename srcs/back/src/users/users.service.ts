import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client'
import console from 'console';
import { CreateUserDto } from './createUserDto';

  const prisma = new PrismaClient();


/// !!!!!!!!!!!!!!!!!!!!! FINISH CHECKS ON FRIENDS AND BAN LISTS => KICK FRIEND ON BAN AND CHECK IF BAN ON FRIEND

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
class UsersService {

  async banUser(id:number, banned:number) {
      const user = await prisma.users.findFirst({where:{id}});
      const ban = await prisma.users.findFirst({where:{id:banned}});
      const begin = new Date();

      if ((user && ban) && user != ban) {
        await 
          prisma.users.update({
            where: {id},
            data: {
              ban_users_ban_users_idTousers: {
                  create:{
                    banned_id: banned,
                    ban_begin: begin
                  }
                }
              },
            },
          )

        return (ban);
        }
        throw new HttpException("Banning user or banned user doesn't exists", HttpStatus.NOT_MODIFIED);
    }
  
  async getBannedUsers(id: number) {
      const user = await prisma.users.findFirst({where:{id}});
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const banned = await prisma.users.findFirst({
        where: {id},
        select: {
          ban_users_ban_users_banned_idTousers: {
            select: {
              banned_id: true,
            }
          }
        }
      })
      return (banned);
  }

  async getUserByNick(nick: string) {
    const res = await prisma.users.findMany({
      where:{
        nickname: {
          startsWith: nick
        }
      },
      select:{
        id: true,
        avatar_url: true,
        nickname: true
      }
    })
    if (!res) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return (res);
  }

  async getUserById(id: number) {
    var user = await prisma.users.findFirst({
      where: {
        id: id
      },
      include:{
        friends: {
          select: {id:true}
        },
        ban_users_ban_users_idTousers: {
          select:{banned_id:true}
        }
      }
    })
    if (!user)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    user.friends = convertUserList(user.friends)
    user.ban_users_ban_users_idTousers = convertBanList(user.ban_users_ban_users_idTousers)
    return (user);
  }

    async getFriends(id: number) {
      const user = await prisma.users.findFirst({where:{id}});
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
        const friends = await prisma.users.findFirst({
          where:{id},
          select: {
            friends: {
              select: {
                friends: {
                 select: {
                   avatar_url:true,
                   id: true,
                   nickname:true
                 }
                }
              }
            }
          }
        });
        return (friends)
    }

    async addFriend(id: number, friend: number) {
        if (id == friend) {
          throw new HttpException("Can't be friend with yourself", HttpStatus.BAD_REQUEST)
        }
        const already_friend = await prisma.users.findFirst({
          where:{id},
          select:{friends:{
            where:{id:friend}
          }}
        })
        if (already_friend) {
          throw new HttpException("Already friends", HttpStatus.BAD_REQUEST)
        }
        const user = await prisma.users.findFirst({
          where: {
            id: id
          } 
        })
        const user_friend = await prisma.users.findFirst({where:{id: friend}});
        if (user && user_friend) {
          await 
          prisma.users.update({
            where: {id},
            data: {
              friends: {
                create: {
                  friend_id: friend
                }
              },
            },
          })
        }
        else {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return (user_friend);
    }

    async getAllUsers() {
      try {
        const users = await prisma.users.findMany();
        // const users = await prisma.users.findMany({include:{
        //   friends: {
        //     select: {
        //       friends: {
        //         select: {
        //           id: true,
        //           avatar_url: true,
        //           nickname: true
        //         }
        //       }
        //     }
        // },
        //   match_match_player_left_idTousers:true,
        //   ban_users_ban_users_banned_idTousers:true,
        //   ban_channels_ban_channels_banned_idTousers:true,
        //   ban_users_ban_users_idTousers: {
        //     select: {
        //       banned_id: true
        //     }
        //   }
        // }})
        return (users);
      } catch (err) {
        console.log("err: ", err)
      }
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
        if (test) {
          throw new HttpException("nickname already taken", HttpStatus.CONFLICT);
        }
    }
    
    async changeNickname(id: number, nickname: string) {
      this.testNickname(nickname);
      const secondTest = await prisma.users.findFirst({where:{id}})
      if (!secondTest) {
        throw new HttpException("User doesn't exists", HttpStatus.NOT_FOUND)
      }
      const newUser = await prisma.users.update({
        where:{id},
        data:{
          nickname
        }
      })
      return (newUser);
    }

    async getOtherUser(id: number) {
        const users = await prisma.users.findFirst(
          {
            where:{
              id
            },
            select:{
            id:true,
            nickname:true,
            first_name:true,
            last_name:true,
            friends: {
              select: {id:true}
            },
            avatar_url:true,
            ranking:true,
            wins:true,
            loses:true,
            match_match_player_left_idTousers:true
            }
      })
        return (users);
    }

    async getUsersRestrict() {
        const users = await prisma.users.findMany({select:{
          id:true,
          nickname:true,
          avatar_url:true
        }})
        return (users);
    }

    async postOneUser(user: CreateUserDto) {
      this.testNickname(user.nickname);
      const existsAlready = await prisma.users.findFirst({where:{nick_fourtytwo: user.nick_fourtytwo}})
      if (existsAlready) {
        throw new HttpException("42 account already binded to a user", HttpStatus.CONFLICT)
      }
      const res = await prisma.users.create( {data: user })
      return (res);
    }

}

export {UsersService};