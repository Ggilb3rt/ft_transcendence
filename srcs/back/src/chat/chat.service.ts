import { ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TChannelRestrict } from 'src/users/types';
import { ChatHelper } from './chat.helper';

@Injectable()
export class ChatService {
    constructor(private chatHelper: ChatHelper, private jwtService: JwtService) {}

    validate(token) {
        // console.log("token in validate in jwt-auth service", token)
        return {
            validate: this.jwtService.verify(token)
        }
      }

    extractToken = (req) => {
        let token = null;
  
        // console.log("extractJwtfromCookie ", req.cookies)
        if (req && req.cookies) {
          token = req.cookies['jwt'];
          // console.log(token)
        }
        return token;
      };

    async getToken(req) {
        const token = this.extractToken(req)
        const verifier = this.validate(token)
        console.log("Verifier == ", verifier);
        return verifier.validate
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

    async banPolicy(channel_id: number, banned: number, req) {


        const isBannedOwner = this.chatHelper.isOwner(channel_id, banned)
        if (isBannedOwner) {
            return false
        }
        const token = await this.getToken(req)
        const bannedBy = token.id
        const isBannedByOwner = this.chatHelper.isOwner(channel_id, bannedBy)
        if (isBannedByOwner) {
            return true
        }
        else if (this.chatHelper.isAdmin(channel_id, bannedBy)) {
            return true
        }
        return false
    }

    async kickUser(channel_id: number, banned: number, req) {
        if (await this.banPolicy(channel_id, banned, req) == false){
            throw new ForbiddenException("Can't kick him")
        }
        return (await this.chatHelper.kickOne(banned, channel_id))
    }

    async banUser(channel_id: number, banned: number, expires: Date, req) {
        // check if ban is in admin
        if (await this.banPolicy(channel_id, banned, req) == false)
            throw new ForbiddenException("You have no right to ban this user")
        return (await this.chatHelper.banOne(banned, channel_id, expires))
    }
    
    async muteUser(channel_id: number, muted: number, expires: Date, req) {
        //check if mute is in admin 
        if (await this.banPolicy(channel_id, muted, req) == false)
            throw new ForbiddenException("You have no right to restrict this user")
        return await this.chatHelper.muteOne(muted, channel_id, expires)
    }

    async joinChannel(user_id: number, channel, pass?: string) {
        if (channel.type === "private") {
            throw new HttpException("You have no right to join this channel", HttpStatus.FORBIDDEN)
        }
        else if (channel.type === "pass") {
            if (!pass) {
                throw new HttpException("Need a password to join this channel", HttpStatus.FORBIDDEN)
            }
            else if (this.chatHelper.checkPass(pass, channel.id)) {
                return await this.chatHelper.joinChannel(channel.id, user_id)
            }
        }
        else if (channel.type === "public") {
            return await this.chatHelper.joinChannel(channel.id, user_id)
        }
    }

    async promoteAdmin(id: number, channel_id: number, req) {
        const token = await this.getToken(req);

        if (!await this.chatHelper.isAdmin(channel_id, token.id) && !await this.chatHelper.isOwner(channel_id, token.id))
            throw new ForbiddenException("You have no right to promote a user")
        if (!await this.chatHelper.isInChannel(channel_id, id))
            throw new ForbiddenException("User needs to join channel before being promoted")
        return await this.chatHelper.addAdmin(id, channel_id)
    }

    async getAvailableChannels(req) {
        const token = await this.getToken(req);

        const user_id = token.id
        const myChannels = await this.chatHelper.getMyChannels(user_id)

        const ids: number[] = []
        myChannels.channels.forEach((elem) => {
            ids.push(elem.id)
        })
        
        const availables = await this.chatHelper.getAvailableChannels()

        const availableChannels: TChannelRestrict[] = [];
        const joinedChannels: TChannelRestrict[] = [];

        availables.forEach((elem) => {
            if (ids.includes(elem.id)) {
                joinedChannels.push(elem)
            }
            else
                availableChannels.push(elem)
        })
        return ({availableChannels, joinedChannels})
    }
}
