import { ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { TChannelRestrict } from 'src/users/types';
import { UsersService } from 'src/users/users.service';
import { UsersHelper } from 'src/users/usersHelpers';
import { ChatHelper } from './chat.helper';

@Injectable()
export class ChatService {
    constructor(private chatHelper: ChatHelper, private jwtService: JwtService, private usersHelper: UsersHelper) {}

    validate(token) {
        // console.log("token in validate in jwt-auth service", token)
        return {
            validate: this.jwtService.verify(token, {secret: process.env.JWT_SECRET})
        }
      }


    extractToken = (req) => {
        let token = null;

        console.log("req == ", req)
        console.log("extractJwtfromCookie ", req.cookies)
        if (req && req.cookie) {
          token = req.cookie;
          if (typeof(token) == "string") {
                const value = token.slice(4)
                console.log("token in extract  ", value)
                return value;
          }
        }
      };

      extractTokenFromReq = (req) => {
        let token = null;
  
        // console.log("extractJwtfromCookie ", req.cookies)
        if (req && req.cookies) {
          token = req.cookies['jwt'];
          // console.log(token)
        }
        return token;
      };


    async getGatewayToken(headers, client: Socket) {
        const token = this.extractToken(headers)
        const verifier = this.validate(token)
        console.log("verifier == ", verifier)
        if (!verifier.validate.id) {
            client.disconnect()
            throw new ForbiddenException("Token invalid")
        }
        return verifier.validate.id
    }

    async getToken(req) {
        const token = this.extractTokenFromReq(req)
        const verifier = this.validate(token)
        return verifier.validate.id
    }

    async tokenIdCheck(req, id) {

        const payload = await this.getToken(req)
        if (payload.id != id) {
            return false
        }
        return true
    }

    async getChannel(channel_id: number, req) {
        const token = await this.getToken(req);

        if (!await this.chatHelper.isInChannel(channel_id, token.id)) {
            throw new ForbiddenException("You have no right to request this channel")
        }
        return await this.chatHelper.formatChannels(channel_id)
    }

    async createChannel(channel) {
        return await this.chatHelper.formatChannels(await this.chatHelper.createChannel(channel))
    }

    async deleteChannel(channel_id: number, req) {
        const channel = await this.chatHelper.getChannel(channel_id);
        if (!await this.tokenIdCheck(req, channel.id))
            throw new ForbiddenException("You have no right to delete this channel")
        return await this.chatHelper.deleteChannel(channel_id)
    }

    async banPolicy(channel_id: number, banned: number, bannedBy: number) {


        const isBannedOwner = this.chatHelper.isOwner(channel_id, banned)
        if (isBannedOwner) {
            return false
        }
        const isBannedByOwner = this.chatHelper.isOwner(channel_id, bannedBy)
        if (isBannedByOwner) {
            return true
        }
        else if (this.chatHelper.isAdmin(channel_id, bannedBy) && !this.chatHelper.isAdmin(channel_id, banned)) {
            return true
        }
        return false
    }

    async kickUser(channel_id: number, banned: number, id) {
        if (await this.banPolicy(channel_id, banned, id) == false && (banned != id)){
            throw new ForbiddenException("Can't kick him")
        }
        return (await this.chatHelper.kickOne(banned, channel_id))
    }

    async banUser(channel_id: number, banned: number, expires: Date, id: number) {
        // check if ban is in admin
        if (await this.banPolicy(channel_id, banned, id) == false)
            throw new ForbiddenException("You have no right to ban this user")
        return (await this.chatHelper.banOne(banned, channel_id, expires))
    }
    
    async muteUser(channel_id: number, muted: number, expires: Date, id: number) {
        //check if mute is in admin 
        if (await this.banPolicy(channel_id, muted, id) == false)
            throw new ForbiddenException("You have no right to restrict this user")
        return await this.chatHelper.muteOne(muted, channel_id, expires)
    }

    async canJoin(user_id: number, channel_id: number, pass?: string) {
        const isBan = await this.chatHelper.getBan(user_id, channel_id)
        if (isBan && isBan.expires > new Date()) {
            return false
        }
        else if (isBan) {
            this.chatHelper.unBan(user_id, channel_id)
        }
        return true
    }

    async canSend(user_id: number, channel_id: number) {
        if (!await this.chatHelper.isInChannel(channel_id, user_id)) {
            return false
        }
        if (!await this.canJoin(user_id, channel_id)) {
            return false
        }
        const mute = await this.chatHelper.getMute(channel_id, user_id)
        if (mute && mute.mute_date > new Date()) {
            return false
        }
        else if (mute) {
            this.chatHelper.unMute(user_id, channel_id)
        }
        return true
    }

    async sendMessageToChannel(channel_id: number, content: string, date: Date, user_id: number) {
        if (!this.canSend(user_id, channel_id)) {
            throw new UnauthorizedException("You can't send a message to this channel")
        }
        await this.chatHelper.sendMessageToChannel(channel_id, user_id, content, date)
    }

    async sendDirectMessage(receiver: number, content: string, date: Date, user_id: number) {
        if (!await this.usersHelper.getFriendship(user_id, receiver)) {
            throw new ForbiddenException("Can't send message if you are not friends")
        }
        await this.chatHelper.sendDirectMessage(receiver, user_id, content, date)
    }

    async getDirectConversation(friend: number, req) {
        const {id: user_id} = await this.getToken(req)
        return await this.chatHelper.getDirectMessages(user_id, friend)
    }
    
    async joinChannel(user_id: number, channel_id: number, pass?: string) {
        if (!this.canJoin(user_id, channel_id, pass))
            throw new ForbiddenException("You have no right to join this channel")
        const {type} = await this.chatHelper.getChannel(channel_id)
        if (type === "private") {
            throw new HttpException("You have no right to join this channel", HttpStatus.FORBIDDEN)
        }
        else if (type === "pass") {
            if (!pass) {
                throw new HttpException("Need a password to join this channel", HttpStatus.FORBIDDEN)
            }
            else if (this.chatHelper.checkPass(pass, channel_id)) {
                return await this.chatHelper.joinChannel(channel_id, user_id)
            }
        }
        else if (type === "public") {
            return await this.chatHelper.joinChannel(channel_id, user_id)
        }
    }

    async promoteAdmin(id: number, channel_id: number, user_id: number) {

        if (!await this.chatHelper.isAdmin(channel_id, user_id) && !await this.chatHelper.isOwner(channel_id, user_id))
            throw new ForbiddenException("You have no right to promote a user")
        if (!await this.chatHelper.isInChannel(channel_id, id))
            throw new ForbiddenException("User needs to join channel before being promoted")
        return await this.chatHelper.addAdmin(id, channel_id)
    }

    async getAvailableChannels(user_id: number) {
        const myChannels = await this.chatHelper.getMyChannels(user_id)

        const ids: number[] = []
        myChannels.forEach((elem) => {
            ids.push(elem.channel_id)
        })
        
        const availables = await this.chatHelper.getAvailableChannels()
        const privateC = await this.chatHelper.getMyPrivateChannels(user_id)

        const availableChannels: TChannelRestrict[] = [];
        const joinedChannels: TChannelRestrict[] = [];

        availables.forEach((elem) => {
            if (ids.includes(elem.id)) {
                joinedChannels.push(elem)
            }
            else
                availableChannels.push(elem)
        })
        
        privateC.forEach((elem) => {
            joinedChannels.push(elem.channels)
        })

        return ({availableChannels, joinedChannels})
    }
}
