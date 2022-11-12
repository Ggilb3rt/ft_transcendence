import { Injectable } from "@nestjs/common";
import { ban_channels, PrismaClient, users_list } from "@prisma/client";
import { TChannel, TChannelType, TMessage, TRestrictUserTime } from "src/users/types";

const bcrypt = require('bcrypt');

const prisma = new PrismaClient()

@Injectable()
export class ChatHelper {
    // TODO: hash all passwords
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
                userList.push(e.user_id)
            });
            banned.forEach((e) => {
               banList.push({userId: e.user_id, expire: e.expires, })
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
                ChanName: name,
                type,
                owner,
                userList,
                banList,
                muteList,
                adminList,
                messages: messagesTrimmed
            }
            console.log("Channel on reload = ", formated_channel)
            return formated_channel
        }

        // format relations to array
        // return
        // const ret: TChannel = {

        // }
    }

    async createChannel(chan: TChannel) {
        try {
            if (chan.pass) {
                // console.log("bcrypt = ", bcrypt)
                console.log("chan = ", chan)
                const hash: string = await bcrypt.hash(chan.pass, 10)
                console.log('hash == ', hash)
                const channel = await prisma.channels.create({
                        data:{
                            name: chan.ChanName,
                            type: chan.type,
                            pass: hash,
                            owner: chan.owner,
                        },
                        select: {
                            pass:true,
                            id: true
                        }
                    })
                    chan.userList.forEach(async (id) => {
                        await this.joinChannel(channel.id, id)
                    })
                    await this.joinChannel(channel.id, chan.owner)
                    await this.addAdmin(chan.owner, channel.id)
                    console.log("channel = ", channel)
                    return channel.id;
            }
            else {
                const channel = await prisma.channels.create({
                    data:{
                        name: chan.ChanName,
                        type: chan.type,
                        owner: chan.owner,
                    },
                    select: {
                        id: true
                    }
                })
                chan.userList.forEach(async (id) => {
                    await this.joinChannel(channel.id, id)
                })
                await this.joinChannel(channel.id, chan.owner)
                await this.addAdmin(chan.owner, channel.id)
                console.log("ou je suis ici ", channel)
                return channel.id;
            }
            
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async addAdmin(admin_id: number, channel_id: number) {
        try {
            const admin = await prisma.admins.findFirst({
                where:{
                    admin_id,
                    channel_id
                }
            })
            if (!admin) {
                await prisma.admins.create({
                    data: {
                        admin_id,
                        channel_id
                    }
                }) 
            }
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async muteOne(muted_id: number, channel_id: number, expires: Date) {
        try {
            const muted = await prisma.muted.findFirst({
                where:{
                    muted_id,
                    channel_id
                }
            })
            if (!muted) {
                return await prisma.muted.create({
                    data: {
                        muted_id,
                        channel_id,
                        mute_date: expires
                    }
                })
            }
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async kickOne(user_id: number, channel_id: number) {
        const userList = await prisma.users_list.findFirst({where: {
            user_id,
            channel_id
        }})
        return await prisma.users_list.delete({
            where: {id: userList.id}
        }) 
    }

    async findUserInChan(user_id: number, channel_id: number) {
        try {
            const userList = await prisma.users_list.findFirst({where: {
                user_id,
                channel_id
            }})
            return userList
        } catch(e) {
            console.log(e)
            throw new Error(`Error querying id:${user_id} in channel[${channel_id}]`)
        }
    }

    async removeUser(user_id: number, channel_id: number) {
        const user = await this.findUserInChan(user_id, channel_id)
        try {
            await prisma.users_list.delete({
                where: user
            })
        } catch (e) {
            console.log(e);
            throw new Error(`Error removing id:${user_id} in channel[${channel_id}]`)
        }
    }

    async banOne(user_id: number, channel_id: number, expires: Date) {
        if (await this.isAdmin(channel_id, user_id)) {
            await this.unAdmin(channel_id, user_id)
        }
        try {
            const alreadyban = await prisma.ban_channels.findFirst({
                where:{
                    channel_id,
                    user_id
                }
            })
            if (!alreadyban) {
            const ban =  await prisma.ban_channels.create({
                data: {
                    user_id,
                    channel_id,
                    expires,
                }
            })
            return ban
        }
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async deleteChannel(id: number) {
        try {
            await prisma.channels.delete({
                where: {
                    id
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMyBans(user_id: number) {
        try {
            const bans = await prisma.ban_channels.findMany({
                where: {
                    user_id
                }
            })
            return bans
        }
        catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }

    }

    async getBan(user_id: number, channel_id: number) {
        try {
            // if (typeof(channel_id) == 'string')
            //     channel_id = parseInt(channel_id)
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

    async unBan(ban: ban_channels) {
        try {
            await prisma.ban_channels.delete({
                where: {id:ban.id}
            })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMyPrivateChannels(id: number) {
        try {
            const myPrivateChannels = await prisma.users_list.findMany({
                where: {
                    user_id: id,
                    channels: {
                        type: 'private'
                    }
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
            return (myPrivateChannels)
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMyChannels(id: number) {
        try {
            const myChannels = await prisma.users_list.findMany({
                where: {
                    user_id: id
                }
            })
            return myChannels
        } catch (e) {
            console.log("error ", e);
            throw new Error("Database Chat Error")
        }
    }

    // async getPrivateChannels() {
       
    // }

    async getAvailableChannels() {
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
                },
                select: {
                    id: true,
                    name: true
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
            return admins
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

    async getMyMutes(user_id: number) {
        try{
            const mutes = await prisma.muted.findMany({
                where:{
                    muted_id: user_id
                }
            })
            return (mutes)
        }
        catch(e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getMute(channel_id: number, muted_id: number) {
        try {
            const mute = await prisma.muted.findFirst({
                where: {
                    channel_id,
                    muted_id
                }
            })
            return (mute)
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getChannelMessages(channel_id: number, isDirect: boolean) {
        try {
            return await prisma.messages.findMany({where: {
                channel_id
            },
            orderBy:{
                message_date:'desc'
            }
        })
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async getDirectMessages(user_id: number, second_user_id: number) {
        try {
            return await prisma.direct_message.findMany({where: {
                OR: [
                    {
                        user_id,
                        second_user_id
                    },
                    {
                        user_id: second_user_id,
                        second_user_id: user_id
                    }
                ],

            },
            orderBy: {
                date: "desc"
            }
        })
        } catch (e) {

        }
    }

    async unMute(channel_id: number, muted) {
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

    async getUser(channel_id: number, user_id: number) {
        const user = await prisma.users_list.findFirst({
            where: {
                channel_id,
                user_id
            }
        })
        if (user)
            return user
        return (null)
    }

    async joinChannel(channel_id: number, user_id: number) {
        try {
            const user = await this.getUser(channel_id, user_id)
            if (!user)
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
            const user = await prisma.users_list.findFirst({
                where: {
                    channel_id,
                    user_id
                }
            })
           return user ? true : false
        } catch (e) {
            console.log(e);
            throw new Error("Database Chat Error")
        }
    }

    async isOwner(channel_id: number, user_id: number) {
        const channel = await this.getChannel(channel_id)

        if (!channel)
            return false
        return channel.owner == user_id ? true : false
    }

    async isAdmin(channel_id: number, user_id: number) {
        const admin = await this.getAdmin(channel_id, user_id)
        if (admin) {
            return true
        }
        return false
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
            console.log("pass = ", pass)
            const hash =  await bcrypt.hash(pass, 10)
                return await prisma.channels.update({
                    where: {
                        id: channel_id
                    },
                    data: {
                        pass: hash
                    }
                })
        } catch (e) {
            console.log(e);
            throw new Error("Error modifying channel passs")
        }
    }

    async checkPass(pass: string, channel_id) {
        const channel = await this.getChannel(channel_id)

        console.log("channel = ", channel)
        console.log("pass = ", pass)


        const checked = await bcrypt.compare(pass, channel.pass)
        console.log("Checked == ", checked)
        return checked
    }

    async sendMessageToChannel(channel_id: number, sender: number, content: string, date: Date) {
        try {
            await prisma.messages.create({
                data: {
                    channel_id,
                    sender_id: sender,
                    content,
                    message_date: date
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error(`Message from ${sender} to channel ${channel_id} failed`)
        }
    }

    async sendDirectMessage(receiver: number, sender: number, content: string, date: Date) {
        try {
            await prisma.direct_message.create({
                data: {
                    user_id: sender,
                    second_user_id: receiver,
                    content,
                    date,
                }
            })
        } catch (e) {
            console.log(e);
            throw new Error(`Message from ${sender} to ${receiver} failed`)
        }
    }

    async getChannel(channel_id: number) {
        try {
            return await prisma.channels.findFirst({
                where: {
                    id: channel_id
                },
                include: {
                    messages: true,
                    users_list: true,
                    admins: true,
                    banned: true,
                    muted: true,
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