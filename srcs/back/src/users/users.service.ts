import { ConsoleLogger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'

  const prisma = new PrismaClient();


/// !!!!!!!!!!!!!!!!!!!!! FINISH CHECKS ON FRIENDS AND BAN LISTS => KICK FRIEND ON BAN AND CHECK IF BAN ON FRIEND

@Injectable()
class UsersService {

  async banUser(id:number, banned:number) {
    try{

      const user = await prisma.users.findUnique({where:{id}});
      const ban = await prisma.users.findUnique({where:{id:banned}});
      const begin = new Date();

      if ((user && ban) && user != ban) {
       // if (await prisma.users.findUnique({where:{id},
        //   select: {
        //     friends: {
        //       where:{
        //         id:banned
        //       }
        //     }
        //   }
        // }))
        await 
          prisma.users.update({
            where: {id},
            data: {
              ban_users_ban_users_idTousers: {
                  create:{
                    // user_id:id,
                    banned_id: banned,
                    ban_begin: begin
                  }
                }
              },
            },
          )

        return (ban);
        }
        throw("User and/or banned user doesn't exist");
    } catch (err) {
      console.log("err: ", err);
      return (err)
    }
  }
  
  async getBannedUsers(id: number) {
    try {
      const banned = await prisma.users.findUnique({
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
    } catch (err) {
      console.log("err: ", err);
    }
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
      throw("404");
    }
    return (res);
  }

  async getUserById(id: number) {
      try {
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
        console.log("string = ", JSON.stringify(user.ban_users_ban_users_idTousers));
        // const newBans = Array.from(user.ban_users_ban_users_idTousers);
        // newBans = user.ban_users_ban_users_idTousers
        // console.log("fais moi rever: \n", newBans)
        console.log("typeof", typeof(user.ban_users_ban_users_idTousers));

        const newFriends = [];
        user.friends.forEach((elem) => {
          newFriends.push(elem.id);
        })

        user.friends = newFriends;
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
        const users = await prisma.users.findMany({include:{
          friends: {select: {
            id:true,
            avatar_url:true,
            nickname:true
          }},
          match_match_player_left_idTousers:true,
          ban_users_ban_users_banned_idTousers:true,
          ban_channels_ban_channels_banned_idTousers:true,
          ban_users_ban_users_idTousers: {
            select: {
              banned_id: true
            }
          }
        }})
        return (users);
      } catch (err) {
        console.log("err: ", err)
      }
    }

    async getOtherUser(id: number) {
      try {
        const users = await prisma.users.findUnique(
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
      } catch (err) {
        console.log("err: ", err)
      }
    }

    async getUsersRestrict() {
     try {
        const users = await prisma.users.findMany({select:{
          id:true,
          nickname:true,
          avatar_url:true
        }})
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