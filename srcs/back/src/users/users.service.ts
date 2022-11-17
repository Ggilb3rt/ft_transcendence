import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
import { friends, match, PrismaClient, users } from '@prisma/client'
import { UsersHelper } from './usersHelpers';
import { CreateUserDto } from './createUserDto';
const path = require('path');
import { Socket } from 'socket.io';
const util = require('util');
import { writeFile } from 'fs';
import { otherFormat, userFront, userRestrict } from './types';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { JwtService } from '@nestjs/jwt';
const fs = require("fs");

  const prisma = new PrismaClient();


@Injectable()
export class UsersService {
  constructor(private usersHelper: UsersHelper, private jwtAuthService: JwtAuthService, private jwtService: JwtService) {}
  

  

  async verify(token: string) {
    if (!token) {
      throw new ForbiddenException("No Token")
    }
    const {validate} = await this.jwtAuthService.validate(token);
    if (!validate.id) {
      throw new ForbiddenException("Invalid Token")
    }
    return (validate.id)
  }

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
        expires: ban_begin
      }
    })
  }
  
  //get []users_id who banned me
  async getBannedMe(id: number): Promise<number[]> {
    await this.usersHelper.getUser(id);

    const bans = await this.usersHelper.getBanned(id)
    return (this.usersHelper.formatBans(bans, id));
  }

  //get []users_id whom i banned
  async getBannedUsers(id: number): Promise<number[]> {
      await this.usersHelper.getUser(id);

      const bans = await this.usersHelper.getBans(id)
      return (this.usersHelper.formatBans(bans, id));
  }

  //deprecated, get userbynick
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

  //get resolved friendships: both agreed
  async getFriends(id: number): Promise<number[]> {

    await this.usersHelper.getUser(id);

    const friends = await this.usersHelper.getFriends(id);
    const arr: number[] = this.usersHelper.formatFriends(friends, id)
    return (arr)
  }
  

  
  async getUserById(id: number): Promise<userFront> {

    const user = await this.usersHelper.getUser(id);

    if (!user) {
      throw new NotFoundException({msg: "No user at this ID", status: false})
    }

    const {nick_fourtytwo, nickname, first_name, last_name, ranking, wins, loses, two_factor_auth, first_connection } = user

    const friends = await this.getFriends(id);
    const bannedBy = await this.getBannedMe(id);
    const bans = await this.getBannedUsers(id);
    const matches = await this.getMatches(id);
    const invites = await this.getPending(id);

    const userFormat: userFront = {
      id,
      nick_fourtytwo,
      nickname,
      first_name,
      last_name,
      ranking,
      wins,
      loses,
      two_factor_auth,
      two_factor_secret: null,
      friends,
      bannedBy,
      bans,
      matches,
      invites,
      first_connection
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
    await this.usersHelper.unBan(ban)
  }

  extractToken = (req) => {
    let token = null;

    if (req && req.cookie) {
      token = req.cookie;
      if (typeof(token) == "string") {
            const value = token.slice(4)
            return value;
      }
    }
  };

  validate(token) {
    
    return {
        validate: this.jwtService.verify(token, {secret: process.env.JWT_SECRET})
    }
  }

  async getGatewayToken(headers, client: Socket) {
    const token = this.extractToken(headers)
    const verifier = this.validate(token)
    if (!verifier.validate.id) {
        client.disconnect()
        throw new ForbiddenException("Token invalid")
    }
    return verifier.validate.id
}

  //create an unresolved friendship: invitation
  async addFriend(id: number, friend: number): Promise<friends> {

    
    this.usersHelper.checkSame(id, friend);
    const already_friend = await this.usersHelper.getFriendship(id, friend)
    if (already_friend && already_friend.status == true) {
      throw new HttpException("Already friends", HttpStatus.BAD_REQUEST)
    } 
    else if (already_friend && already_friend.friend_id == id) {
      this.acceptFriend(id, friend, true)
      return
    } 
    else if (already_friend && already_friend.user_id == id) {
      throw new HttpException("You already sent invite", HttpStatus.CONFLICT)
    }

    
    
    await this.usersHelper.getUser(id);
    await this.usersHelper.getUser(friend);
    const ban = await this.usersHelper.getBan(id, friend) 
  

    if (ban && ban.banned_id == id) {
      throw new HttpException("Banned by this user", HttpStatus.FORBIDDEN)
    }
    
    
    
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
  async acceptFriend(id: number, friend: number, valid: boolean): Promise<friends> {
    this.usersHelper.checkSame(id, friend);
    const friendship = await this.usersHelper.getFriendship(id, friend)
    if (!valid) {
      await this.usersHelper.unFriend(friendship)
      return
    }
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
    throw new NotFoundException("No pending invites")
  }

  //get pending friendships
  async getPending(id: number): Promise<number[]> {
    const invites = await this.usersHelper.getPending(id);
    return (this.usersHelper.formatFriends(invites, id));
  }


  //get everything xcept relations
  async getAllUsers(): Promise<users[]> {
    try {
      const users = await prisma.users.findMany();
      return (users);
    } catch (e) {
      throw new HttpException(e, 401)
    }
  }
  
  //do i need to explain?
  async changeNickname(id: number, nickname: string): Promise<users | false> {
    try {
      const test = await this.usersHelper.testNickname(nickname);
      if (!test) {
        
        return false
      }
      await this.usersHelper.getUser(id);
  
      return await prisma.users.update({
        where:{id},
        data:{
          nickname
        }
      })
    } catch (e) {
      throw new HttpException(e, 401)
    }
  }

  //another way to request partial user
  async getOtherUser(id: number): Promise<otherFormat> {

    try {
      //
      const user = await prisma.users.findFirst({where:{id}})

      const {nickname, first_name, last_name, ranking, wins, loses} = user
      const matches = await this.getMatches(id);
      const friends = await this.getFriends(id);
  
      const otherFormat: otherFormat = {
        id,
        nickname,
        first_name,
        last_name,
        ranking,
        wins,
        loses,
        friends,
        matches
      }
  
       return (otherFormat)
    } catch (e) {
      throw new HttpException(e, 401)
    }
  }

  //and another other way
  async getUsersRestrict(): Promise<userRestrict[]> {
      return this.usersHelper.getUsersRestrict()
  }

  //add a user in DB
  async postOneUser(user: CreateUserDto): Promise<users> {
    return await this.usersHelper.postOneUser(user)
  }

  //Get match history for user
  async getMatches(id:number): Promise<match[]>{
    return await this.usersHelper.getMatches(id);
  }

  async getAvatar(id:number): Promise<string> {

    const user = await this.usersHelper.getUser(id);

    const dest: string = path.join('/app/resources/', (id.toString() + '_id.jpeg'))

    if (fs.existsSync(dest)) {
      return dest
    }
    return "/app/resources/default.jpeg"
  }

  extractTokenFromReq = (req) => {
    let token = null;

    
    if (req && req.cookies) {
      token = req.cookies['jwt'];
      
    }
    return token;
  };


  async getToken(req) {
    const token = this.extractTokenFromReq(req)
    const verifier = this.validate(token)
    return verifier.validate.id
}

  async changeAvatar(id:number, file: Express.Multer.File): Promise<string> {
    
    const user = await this.usersHelper.getUser(id);

    const myWriteFile = util.promisify(writeFile)
    //("change avatar ", user.id.toString())
    const dest: string = path.join('/app/resources/', (user.id.toString() + '_id.jpeg'))

    //
    try {
      await myWriteFile(dest, file.buffer, 'ascii')
    } catch (e) {
      throw new Error('writing file to fs failed')
    }
    //
    return (dest);
  }


  async isCodeValid(code: string, id: number) {
    const {two_factor_secret} = await prisma.users.findFirst({
      where:{id}
    })
    try {
      const verify = authenticator.verify({
        token: code,
        secret: two_factor_secret
      })
      return verify
    } catch (e) {
      console.error("error in back ", e);
      throw new Error (e);
    }
  }

  async pipeQrCodeStream (stream: Response, otpauthUrl: string) {
      return toFileStream(stream, otpauthUrl);
  }

  async generate2faSecret(id: number) {
    const user = await this.getUserById(id);
    const secret = authenticator.generateSecret()
    const otpauthUrl = authenticator.keyuri(user.nick_fourtytwo, "Transcendance", secret);

    await this.setSecret(user.id, secret);
    return {
        secret,
        otpauthUrl
    }
  }

  async isBan(id: number, ban: number) {
    const banned = await this.usersHelper.getBan(id, ban)
    
    if (banned)
      return true
    return false
  }

  async switch2fa(id: number, status: boolean, response) {
    try {

      await this.usersHelper.getUser(id);

      const ret = await prisma.users.update({
        where:{id},
        data:{
          two_factor_auth: status
        }
      })
      
      if (ret.two_factor_auth == true) {
        const { otpauthUrl } = await this.generate2faSecret(id);
        return this.pipeQrCodeStream(response, otpauthUrl);
      }
    } catch (e) {
      throw new HttpException(e, 401)
    }
  }

  async setSecret(id: number, secret: string) {
    this.usersHelper.setSecret(id, secret)
  }
}