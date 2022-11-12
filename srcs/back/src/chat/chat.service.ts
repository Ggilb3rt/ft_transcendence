import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ban_channels, muted, users_list } from '@prisma/client';
import { Socket } from 'socket.io';
import { TChannelRestrict, TChannelType } from 'src/users/types';
import { UsersHelper } from 'src/users/usersHelpers';
import { ChatHelper } from './chat.helper';

@Injectable()
export class ChatService {
    constructor(
        private chatHelper: ChatHelper, private jwtService: JwtService, private usersHelper: UsersHelper) {}

    validate(token) {
        // console.log("token in validate in jwt-auth service", token)
        return {
            validate: this.jwtService.verify(token, {secret: process.env.JWT_SECRET})
        }
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


        if (!await this.chatHelper.isInChannel(channel_id, token.id) || await this.chatHelper.getBan(token, channel_id)) {
           return false
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


        const isBannedOwner = await this.chatHelper.isOwner(channel_id, banned)
        if (isBannedOwner) {
            return false
        }
        const isBannedByOwner = await this.chatHelper.isOwner(channel_id, bannedBy)
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
            return false
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
            await this.chatHelper.unBan(isBan)
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
        console.log("channel_id, user_id ", channel_id, user_id)
        console.log("mute ", mute)
        if (mute && mute.mute_date > new Date()) {
            console.log("tout va bien")
            return false
        }
        else if (mute) {
            this.chatHelper.unMute(channel_id, user_id)
        }
        return true
    }

    async sendMessageToChannel(channel_id: number, content: string, date: Date, user_id: number) {
        if (!await this.canSend(user_id, channel_id)) {
            return false
        }
        await this.chatHelper.sendMessageToChannel(channel_id, user_id, content, date)
        return true
    }

    async sendDirectMessage(receiver: number, content: string, date: Date, user_id: number) {
        if (!await this.usersHelper.getFriendship(user_id, receiver)) {
           return false
        }
        await this.chatHelper.sendDirectMessage(receiver, user_id, content, date)
        return true
    }

    async getDirectConversation(friend: number, req) {
        const {id: user_id} = await this.getToken(req)
        return await this.chatHelper.getDirectMessages(user_id, friend)
    }

    async joinChannel(user_id: number, channel_id: number, pass?: string) {
        if (!this.canJoin(user_id, channel_id, pass))
            return {msg: 'no right', status: false}
        const {type} = await this.chatHelper.getChannel(channel_id)
        if (type === "private") {
            return {msg: 'no right', status: false}
        }
        else if (type === "pass") {
            if (!pass) {
                return {msg: 'need pass', status: false}
            }
            else if (await this.chatHelper.checkPass(pass, channel_id)) {
                await this.chatHelper.joinChannel(channel_id, user_id)
                return {msg: 'joined', status: true}
            }
            console.log("OULA")
            return {msg: 'password incorrect', status: false}
        }
        else if (type === "public") {
                await this.chatHelper.joinChannel(channel_id, user_id)
            return {msg: 'joined', status: true}
        }
    }

    async promoteAdmin(id: number, channel_id: number, user_id: number) {

        if (!await this.chatHelper.isAdmin(channel_id, user_id) && !await this.chatHelper.isOwner(channel_id, user_id))
            return false
        if (!await this.chatHelper.isInChannel(channel_id, id))
            return false
        await this.chatHelper.addAdmin(id, channel_id)
        return true
    }

    async changePass(channel_id: number, id: number, pass: string){
        if (await this.chatHelper.isOwner(channel_id, id) == false) {
            return false
        }
        console.log("arg == ", id, pass)
        await this.chatHelper.changePass(channel_id, pass)
        return true
    }

    async changeChannelType(channel_id: number, type: TChannelType, id: number, pass?: string) {
        if (type != "direct" && type != "pass" && type != "private" && type != "public")
            return false
        else if (await this.chatHelper.isOwner(channel_id, id) == false)
            return false
        await this.chatHelper.changeChannelType(channel_id, type)
        if (pass) {
            await this.chatHelper.changePass(channel_id, pass)
        }
        return true
    }

    async getMyChannels(user_id: number) {
        return await this.chatHelper.getMyChannels(user_id)
    }

    async getBan(user_id: number, channel_id: number) {
        return await this.chatHelper.getBan(user_id, channel_id)
    }

    async getMyMutes(user_id: number) {
        return await this.chatHelper.getMyMutes(user_id)
    }

    async getMyBans(user_id: number) {
        return await this.chatHelper.getMyBans(user_id)
    }

    async unMute(channel_id: number, muted: number) {
        return await this.chatHelper.unMute(channel_id, muted)
    }

    async unBan(ban: ban_channels) {
        return await this.chatHelper.unBan(ban)
    }

    async demote(channel_id: number, demoted_id: number, demoter_id: number) {
        if (!await this.chatHelper.isOwner(channel_id, demoter_id))
            return false
        await this.chatHelper.unAdmin(channel_id, demoted_id)
        return true
    }

    async getAvailableChannels(user_id: number, myChannels: users_list[]) {


        
        const availables = await this.chatHelper.getAvailableChannels()
        const privateC = await this.chatHelper.getMyPrivateChannels(user_id)

        const availableChannels: TChannelRestrict[] = [];
        const joinedChannels: TChannelRestrict[] = [];
        const ids: number[] = [];

        myChannels.forEach((elem) => {
            ids.push(elem.channel_id)
        })

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
