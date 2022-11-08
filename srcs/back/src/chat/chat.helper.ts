import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TChannel, TChannelType, TMessage } from "src/users/types";

const prisma = new PrismaClient()

@Injectable()
export class ChatHelper {
    async createChannel(chan: TChannel) {
        const channel = await prisma.channels.create({
            data:{
                name: chan.name,
                type: chan.type,
                pass: chan.pass,
                owner: chan.owner,
            }
        })
        return channel;
    }

    async addAdmin(admin_id: number, channel_id: number) {
        const admin = await prisma.admins.create({
            data: {
                admin_id,
                channel_id
            }
        })
    }

    async muteOne(muted_id: number, channel_id: number) {
        const mute_date = new Date()
        const muted = await prisma.muted.create({
            data: {
                muted_id,
                channel_id,
                mute_date
            }
        })
        return muted
    }

    async banOne(user_id: number, channel_id: number, expires) {
        const ban = await prisma.ban_channels.create({
            data: {
                user_id,
                channel_id,
                expires,
            }
        })
        return ban
    }

    async deleteChannel(chan: TChannel) {
        await prisma.channels.delete({
            where: {
                id: chan.id
            }
        })
    }

    async getBan(user_id: number, channel_id: number) {
        const ban = await prisma.ban_channels.findFirst({where: {
            user_id,
            channel_id
        }})
        return (ban)
    }

    async unBan(user_id: number, channel_id: number) {
        const ban = await this.getBan(user_id, channel_id)
        await prisma.ban_channels.delete({
            where: {
                id: ban.id
            }
        })
    }
    
    async postMessage(message: TMessage) {
        if (message.isDirect) {
            await prisma.messages.create({data: {
                content: message.msg,
                relation: message.receiver,
                sender_id: message.sender,
                message_date: message.date
            }})
        }
        else {
            await prisma.messages.create({data: {
                content: message.msg,
                relation: message.receiver,
                channel_id: message.sender,
                message_date: message.date
            }})
        }
    }

    async getMyChannels(id: number) {
        const myChannels = await prisma.users.findUnique({
            where: {
                id
            },
            select: {
                channels: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        })
        return myChannels
    }

    async getAvailableChannels(id: number) {
        const availableChannels = await prisma.channels.findMany({
            where: {
                OR: [
                    {
                        type: 'public'
                    },
                    {
                        type: 'pass'
                    }
                ]
            }
        })
        return availableChannels
    }

    async getMutes(channel_id: number) {
        const muted = await prisma.muted.findMany({
            where: {
                channel_id
            }
        })
    }

    async getAdmins(channel_id: number) {
        const admins = await prisma.admins.findMany({
            where: {
                channel_id
            }
        })
    }

    async getAdmin(channel_id: number, user_id: number) {
        return await prisma.admins.findFirst({
            where: {
                channel_id,
                admin_id: user_id
            }
        })
    }

    async getMute(channel_id: number, muted_id: number) {
        return await prisma.muted.findFirst({
            where: {
                channel_id,
                muted_id
            }
        })
    }

    async getMessages(channel_id: number, isDirect: boolean) {
        if (isDirect) {
            return await prisma.messages.findMany({where: {
                relation: channel_id
            }})
        }
        else {
            return await prisma.messages.findMany({where: {
                channel_id
            }})
        }
    }

    async unMute(channel_id: number, muted, number) {
        const mute = await this.getMute(channel_id, muted)
        await prisma.muted.delete({
            where: {
                id: mute.id
            }
        })
    }

    async unAdmin(channel_id: number, admin_id: number) {
        const admin = await this.getAdmin(channel_id, admin_id)
        return await prisma.admins.delete({
            where: {
                id: admin.id
            }
        })
    }

    async joinChannel(channel_id: number, user_id: number) {
        return await prisma.users_list.create({
            data: {
                channel_id,
                user_id
            }
        })
    }

    async isInChannel(channel_id, user_id) {
        return ((await prisma.users_list.findFirst({
            where: {
                channel_id,
                user_id
            }
        })) ? true : false)
    }

    async isOwner(channel_id: number, user_id: number) {
        return (await prisma.channels.findFirst({
            where: {
                id: channel_id,
                owner: user_id
            }
        }) ? true : false)
    }

    async leaveChannel(channel_id: number, user_id: number) {
        const user = await prisma.users_list.findFirst({
            where: {
                channel_id,
                user_id
            }
        })
        return await prisma.users_list.delete({
            where: {
                id: user.id
            }
        })
    }

    async renameChannel(channel_id: number, name: string) {
        return await prisma.channels.update({
            where: {
                id: channel_id
            }, 
            data: {
                name
            }
        })
    }

    async changeChannelType(channel_id: number, type: TChannelType) {
        return await prisma.channels.update({
            where: {
                id: channel_id
            },
            data: {
                type
            }
        })
    }

    async changePass(channel_id: number, pass: string) {
        return await prisma.channels.update({
            where: {
                id: channel_id
            },
            data: {
                pass
            }
        })
    }

    // isInChannel(userId:number): boolean { this.userList.find(el => el == userId) ? true : false }
	// 	isOwner(userId:number): boolean { userId == this.owner ? true : false }
	// 	isAdmin(userId:number): boolean { this.adminList.find(el => el == userId) ? true : false }
	// 	isMute(userId:number): boolean { this.muteList.find(el => el.userId == userId) ? true : false }
	// 	endOfMute(userId:number): Date | null {
	// 		const mutedUser: TRestrictUserTime = this.muteList.find(el => el.userId == userId)

	// 		if (mutedUser)
	// 			return mutedUser.expire
	// 		return null
	// 	} (soit ça soit isMute() return directement la Date ?)
	// 	isBan(userId:number): Date { this.banList.find(el => el.userId == userId) ? true : false} (même chose que endOfMute mais en version Ban)
    // leaveChannel(userId:number, channelId:number): boolean {
    //     // check channelId exist
    //         // check user is in chan.userList
    //             // remove userId from chan.userList
    //             // return true
    //     // return false
    // }
    // renameChannel(userId:number, channelId:number, newName:string): boolean {
    //     // if channelId exist
    //         // if isOwner(userId)
    //             // if newName != chan.name
    //                 // chan.name = newName
    //                 // return true
    //     return false
    // }
    // changeChannelType(userId:number, channelId:number, newType:TChannel, pass?:string): boolean {
    //     // if channelId exist
    //         // if isOwner(userId)
    //             // if newType != chan.type
    //                 // if newType === "pass" && pass.length > 5
    //                     // chan.type = newType
    //                     // chan.pass = pass
    //                     // return true
    //                 // else if newType === "direct"
    //                     // return false
    //                 // else
    //                     // chan.type = newType
    //                     // return true
    //     return false
    // }
    // changePass(userId:number, channelId:number, newPass:string): boolean {
    //     // if channelId exist
    //         // if isOwner(userId)
    //             // if chan.type == "pass"
    //                 // if chan.pass != newPass && chan.pass > 5
    //                     // chan.pass = newPass
    //                     // return true
    //     // return false
    // }
    // addAdmin(nominator:number, nominated:number, channelId:number): boolean {
    //     // if channelId exist
    //         // if chan.isAdmin(nominator) && !chan.isAdmin(nominated)
    //             // chan.adminList.push(nominated)
    //             // return true
    //     return false
    // }
    // removeAdmin(remover:number, removed:number, channelId:number): boolean {
    //     // if channelId exist
    //         // if chan.isOwner(remover) && chan.isAdmin(removed) && remover != removed && removed != chan.owner
    //             // const find = chan.adminList.findIndex(el => el == removed)
    //             // chan.adminList.splice(find, 1)
    //             // return true
    //     return false
    // }
    // restrictUser(restrictor:number, restricted:number, channelId:number, onlyMute: boolean): boolean {
    //     // if channelId exist
    //         // if chan.isAdmin(restrictor)
    // }


}