import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { TChannel, TChannelType, TMessage, TRestrictUserTime } from "src/users/types";

const prisma = new PrismaClient()

@Injectable()
export class ChatHelper {
    // TODO: hash all passwords

    formatRestrictTime(ban) {
        
    }

    async formatChannels(channel_id: number) {

        const { id, name, type, owner, users_list, banned, messages, muted, admins } = await this.getChannel(channel_id)

        const ChannelTypes = ["public" , "private" , "pass" , "direct"] as const
        const isChannelType = (type): type is TChannelType => ChannelTypes.includes(type)
        if (isChannelType(type)) {
            const userList: number[] = [];
            const banList: TRestrictUserTime[] = []
            const muteList: TRestrictUserTime[] = []
            const adminList: number[] = []
            const messagesTrimmed: TMessage[] = []
            users_list.forEach((e) => {
                userList.push(e.id)
            });
            banned.forEach((e) => {
               banList.push({userId: e.user_id, expire: e.expires})
            })
            muted.forEach((e) => {
                muteList.push({userId: e.muted_id, expire: e.mute_date})
            })
            admins.forEach((e) => {
                adminList.push(e.admin_id)
            })
            messages.forEach((e) => {
                messagesTrimmed.push({
                    sender: e.sender_id,
                    receiver: e.channel_id,
                    isDirect: false,
                    msg: e.content,
                    date: e.message_date
                })
            })
            const formated_channel: TChannel = {
                id,
                name,
                type,
                owner,
                userList,
                banList,
                muteList,
                adminList,
                messages: messagesTrimmed
            }
            return formated_channel
        }

        // format relations to array
        // return
        // const ret: TChannel = {

        // }
    }

    async createChannel(chan: TChannel) {
        try {
            const channel = await prisma.channels.create({
                data:{
                    name: chan.name,
                    type: chan.type,
                    pass: chan.pass,
                    owner: chan.owner,
                }
            })
            return channel;
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async addAdmin(admin_id: number, channel_id: number) {
        try {
            const admin = await prisma.admins.create({
                data: {
                    admin_id,
                    channel_id
                }
            }) 
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async muteOne(muted_id: number, channel_id: number) {
        try {
            const mute_date = new Date()
            const muted = await prisma.muted.create({
                data: {
                    muted_id,
                    channel_id,
                    mute_date
                }
            })
            return muted
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async banOne(user_id: number, channel_id: number, expires) {
        try {
            const ban = await prisma.ban_channels.create({
                data: {
                    user_id,
                    channel_id,
                    expires,
                }
            })
            return ban
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async deleteChannel(chan: TChannel) {
        try {
            await prisma.channels.delete({
                where: {
                    id: chan.id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getBan(user_id: number, channel_id: number) {
        try {
            const ban = await prisma.ban_channels.findFirst({where: {
                user_id,
                channel_id
            }})
            return (ban)
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async unBan(user_id: number, channel_id: number) {
        try {
            const ban = await this.getBan(user_id, channel_id)
            await prisma.ban_channels.delete({
                where: {
                    id: ban.id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }
    
    async postMessage(message: TMessage) {
        try {
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
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMyChannels(id: number) {
        try {
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
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getAvailableChannels(id: number) {
        try {
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
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMutes(channel_id: number) {
        try {
            const muted = await prisma.muted.findMany({
                where: {
                    channel_id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getAdmins(channel_id: number) {
        try {
            const admins = await prisma.admins.findMany({
                where: {
                    channel_id
                }
            })  
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getAdmin(channel_id: number, user_id: number) {
        try {
            return await prisma.admins.findFirst({
                where: {
                    channel_id,
                    admin_id: user_id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMute(channel_id: number, muted_id: number) {
        try {
            return await prisma.muted.findFirst({
                where: {
                    channel_id,
                    muted_id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMessages(channel_id: number, isDirect: boolean) {
        try {
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
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async unMute(channel_id: number, muted, number) {
        try {
            const mute = await this.getMute(channel_id, muted)
            await prisma.muted.delete({
                where: {
                    id: mute.id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async unAdmin(channel_id: number, admin_id: number) {
        try {
            const admin = await this.getAdmin(channel_id, admin_id)
            return await prisma.admins.delete({
                where: {
                    id: admin.id
                }
            })  
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async joinChannel(channel_id: number, user_id: number) {
        try {
            return await prisma.users_list.create({
                data: {
                    channel_id,
                    user_id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async isInChannel(channel_id, user_id) {
        try {
            return ((await prisma.users_list.findFirst({
                where: {
                    channel_id,
                    user_id
                }
            })) ? true : false)
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async isOwner(channel_id: number, user_id: number) {
        try {
            return (await prisma.channels.findFirst({
                where: {
                    id: channel_id,
                    owner: user_id
                }
            }) ? true : false)
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async leaveChannel(channel_id: number, user_id: number) {
        try {
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
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async renameChannel(channel_id: number, name: string) {
        try {
            return await prisma.channels.update({
                where: {
                    id: channel_id
                }, 
                data: {
                    name
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async changeChannelType(channel_id: number, type: TChannelType) {
        try {
            return await prisma.channels.update({
                where: {
                    id: channel_id
                },
                data: {
                    type
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async changePass(channel_id: number, pass: string) {
        try {
            return await prisma.channels.update({
                where: {
                    id: channel_id
                },
                data: {
                    pass
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Error modifying channel passs")
        }
    }

    async getChannel(channel_id: number) {
        try {
            return await prisma.channels.findUnique({
                where: {
                    id: channel_id
                },
                include: {
                    messages: true,
                    users_list: true,
                    admins: true,
                    banned: true,
                    muted: true
                }
            })
        } catch (error) {
            throw new Error("error queriying a channel")
        }
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