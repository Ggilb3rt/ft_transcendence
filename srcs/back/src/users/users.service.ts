import { HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { match, PrismaClient, users } from '@prisma/client'
import { UsersHelper } from './usersHelpers';
import { CreateUserDto } from './createUserDto';
const path = require('path');
const util = require('util');
import { writeFile } from 'fs';

  const prisma = new PrismaClient();


@Injectable()
export class UsersService {
  constructor(private usersHelper: UsersHelper) {}


  // OPERATIONS AROUND USERS AND RELATIONS BETWEEN THEM

  // ban user
  async banUser(id:number, banned:number) {
    this.usersHelper.checkSame(id, banned);
    await this.usersHelper.getUser(id);
    await this.usersHelper.getUser(banned);
    if (await this.usersHelper.getBan(id, banned))
      throw new HttpException("Already banned", HttpStatus.BAD_REQUEST)


    const friendship = await this.usersHelper.getFriendship(id, banned);
    const ban_begin = new Date();


    if (friendship) {
      this.usersHelper.unFriend(friendship);
    }
    return await prisma.ban_users.create({
      data:{
        user_id:id,
        banned_id:banned,
        ban_begin
      }
    })
  }
  
  //get []users_id who banned me
  async getBannedMe(id: number) {
    await this.usersHelper.getUser(id);

    const bans = await this.usersHelper.getBanned(id)
    return (this.usersHelper.formatBans(bans, id));
  }

  //get []users_id whom i banned
  async getBannedUsers(id: number) {
      await this.usersHelper.getUser(id);

      const bans = await this.usersHelper.getBans(id)
      return (this.usersHelper.formatBans(bans, id));
  }

  //deprecated, get userbynick
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
  

  //get resolved friendships: both agreed
  async getFriends(id: number) {

    await this.usersHelper.getUser(id);

    const friends = await this.usersHelper.getFriends(id);
    const arr: number[] = this.usersHelper.formatFriends(friends, id)
    return (arr)
  }
  

  // main getter for users: every info front needs 
  async getUserById(id: number) {

    const user = await this.usersHelper.getUser(id);

    let userFormat: users & {
      friends: number[],
      bannedBy: number[],
      bans: number[],
      matches: match[]
    }

    const {nick_fourtytwo, nickname, first_name, last_name, avatar_url, ranking, wins, loses, two_factor_auth} = user

    const friends = await this.getFriends(id);
    const bannedBy = await this.getBannedMe(id);
    const bans = await this.getBannedUsers(id);
    const matches = await this.getMatches(id);

    userFormat = {
      id,
      nick_fourtytwo,
      nickname,
      first_name,
      last_name,
      avatar_url,
      ranking,
      wins,
      loses,
      two_factor_auth,
      two_factor_secret,
      friends,
      bannedBy,
      bans,
      matches
    }

    return (userFormat);
  }


  //remove one friend
  async removeFriend(id:number, friend:number) {
    
    this.usersHelper.checkSame(id, friend);
    const friendship = await this.usersHelper.getFriendship(id, friend)
    if (!friendship) {
      throw new HttpException("Is not your friend", HttpStatus.BAD_REQUEST)
    }
    await this.usersHelper.unFriend(friendship);
  }

  async unBan(id:number, banned:number) {
    const ban = await this.usersHelper.getBan(id, banned)
    return await this.usersHelper.unBan(ban)
  }

  //create an unresolved friendship: invitation
  async addFriend(id: number, friend: number) {

    // check if ids are the same and if they are not already friends. If there is an invite pending for me, accept it
    this.usersHelper.checkSame(id, friend);
    const already_friend = await this.usersHelper.getFriendship(id, friend)
    if (already_friend && already_friend.status == true) {
      throw new HttpException("Already friends", HttpStatus.BAD_REQUEST)
    } 
    else if (already_friend && already_friend.friend_id == id) {
      this.acceptFriend(id, friend)
    } 
    else if (already_friend && already_friend.user_id == id) {
      throw new HttpException("You already sent invite", HttpStatus.CONFLICT)
    }

    // check if both users exists and if not banned,
    // if banned by me, erase ban
    await this.usersHelper.getUser(id);
    await this.usersHelper.getUser(friend);
    const ban = await this.usersHelper.getBan(id, friend) 
  

    if (ban && ban.banned_id == id) {
      throw new HttpException("Banned by this user", HttpStatus.FORBIDDEN)
    }// else if (ban && ban.user_id == id) {
    //   this.usersHelper.unBan(ban)
    // }
    
    //create and return friendship
    const friendship = await prisma.friends.create({
      data: {
        user_id: id,
        friend_id: friend,
        status: false
      }
    })
    return (friendship);
  }

  //accept a friend invitation
  async acceptFriend(id: number, friend: number) {
    this.usersHelper.checkSame(id, friend);
    const friendship = await this.usersHelper.getFriendship(id, friend)
    if (friendship && friendship.status == false && friendship.friend_id == id) {
      return await prisma.friends.update({
        where: {
          id: friendship.id,
        },
        data:{
          status: true
        }
      })
    }
    return ("No pending invite")
  }

  //get pending friendships
  async getPending(id: number) {
    const invites = await this.usersHelper.getPending(id);
    return (this.usersHelper.formatFriends(invites, id));
  }


  //get everything xcept relations
  async getAllUsers() {
      const users = await prisma.users.findMany();
      return (users);
  }
  
  //do i need to explain?
  async changeNickname(id: number, nickname: string) {

    this.usersHelper.testNickname(nickname);
    await this.usersHelper.getUser(id);

    return await prisma.users.update({
      where:{id},
      data:{
        nickname
      }
    })

  }

  //another way to request partial user
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
          match_match_player_left_idTousers:true,
          match_match_player_right_idTousers:true
          }
        })
      return (users);
  }

  //and another other way
  async getUsersRestrict() {
      const users = await prisma.users.findMany({select:{
        id:true,
        nickname:true,
        avatar_url:true
      }})
      return (users);
  }

  //add a user in DB
  async postOneUser(user: CreateUserDto) {
    this.usersHelper.testNickname(user.nickname);
    const existsAlready = await prisma.users.findFirst({where:{nick_fourtytwo: user.nick_fourtytwo}})
    if (existsAlready) {
      throw new HttpException("42 account already binded to a user", HttpStatus.CONFLICT)
    }
    return await prisma.users.create( {data: user })
  }

  //Get match history for user
  async getMatches(id:number) {
    return await this.usersHelper.getMatches(id);
  }

  async getAvatar(id:number) {

    const user = await this.usersHelper.getUser(id);
    return user.avatar_url;
  }

  async changeAvatar(id:number, file: Express.Multer.File) {
    
    const user = await this.usersHelper.getUser(id);

    const myWriteFile = util.promisify(writeFile)
    const dest = path.join('/app/resources/', user.id.toString() + '_id.jpeg')

    await myWriteFile(dest, file.buffer, 'ascii')
    const ret = await this.usersHelper.changeAvatarUrl(id, dest);
    console.log(ret)
    return (dest);
  }

  async switch2fa(id: number, status: boolean) {
    const user = await this.usersHelper.getUser(id);

    const ret = await prisma.users.update({
      where:{id},
      data:{
        two_factor_auth: status
      }
    })
    return ret
  }
}