import { defineStore, mapGetters } from "pinia";
import { useUsersStore } from "./users";
import { ref } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import { io } from "socket.io-client";
import { CChannel } from "@/helpers/class.channel";
import type {
  IChannel,
  IChannelRestrict,
  TChannelType,
  TMessage,
} from "../../typesChat";
import { useUserStore } from "./user";

interface IChannelsStore {
  availableChannels: IChannelRestrict[];
  joinedChannels: IChannelRestrict[];
  openChan: CChannel[];
  currentChan: CChannel | null;
  loading: boolean;
  error: any;
}

export const useChannelsStore = defineStore("channels", () => {
  const usersStore = useUsersStore();
  const userStore = useUserStore();
  const route = useRoute();
  const availableChannels = ref<IChannelRestrict[]>([]);
  const joinedChannels = ref<IChannelRestrict[]>([]);
  const openChan = ref<CChannel[]>([]);
  const openDirect = ref<CChannel[]>([]);
  const currentChan = ref<CChannel | null>(null);
  const error = ref<string>("");

  const refsocket = ref(
    io("http://localhost:3000/chat", {
      withCredentials: true,
      query: {
        userId: userStore.user.id,
      },
    })
  );

  const loading = ref<boolean>(false);
  const myRooms: string[] = [];

  function getChanIndex(rhs: number, isDirect: boolean): number {
    const directType: TChannelType = "direct";
    if (!isDirect) {
      const toto = openChan.value.findIndex((elem) => {
        return elem.getId() === rhs && elem.getType() != directType;
      });
      return toto;
    } else {
      return openChan.value.findIndex((elem) => {
        return elem.getId() === rhs && elem.getType() === directType;
      });
    }
  }
  
  function moveToAnotherArray<T>(
    arrFrom: Array<T>,
    arrTo: Array<T>,
    index: number
  ) {
    arrTo.push(arrFrom[index]);
    arrFrom.splice(index, 1);
  }
  function switchJoinedAvailable(chan: number, isFromJoined: boolean): boolean {
    let findIndex;

    if (isFromJoined) {
      findIndex = joinedChannels.value.findIndex((el) => el.id == chan);
      if (findIndex != -1) {
        moveToAnotherArray<IChannelRestrict>(
          joinedChannels.value,
          availableChannels.value,
          findIndex
        );
        return true;
      }
    } else {
      findIndex = availableChannels.value.findIndex((el) => el.id == chan);
      if (findIndex != -1) {
        moveToAnotherArray<IChannelRestrict>(
          availableChannels.value,
          joinedChannels.value,
          findIndex
        );
        return true;
      }
    }
    return false;
  }

  
  function emitMessage(channel_id: number, content: string) {
    const date = new Date();
    refsocket.value.emit(
      "sendMessageToChannel",
      { channel_id: channel_id, content: content, date: date },
      (res: boolean) => {
        if (res && currentChan.value) {
          currentChan.value.sendMessage({
            sender: userStore.user.id,
            receiver: channel_id,
            msg: content,
            isDirect: false,
            date: date,
          });
        }
      }
    );
  }

  function emitDirectMessage(receiver: number, content: string) {
    const date = new Date();
    refsocket.value.emit(
      "sendDirectMessage",
      { content: content, receiver, date: date },
      (res: boolean) => {
        if (res && currentChan.value) {
          currentChan.value.sendMessage({
            sender: userStore.user.id,
            receiver: receiver,
            msg: content,
            isDirect: true,
            date: date,
          });
        }
      }
    );
  }

  function emitPromoteUser(channel_id: number, promoted_id: number) {
    refsocket.value.emit(
      "promote",
      { promoted_id: promoted_id, channel_id: channel_id },
      (res: boolean) => {
        if (res && currentChan.value)
          currentChan.value.addAdmin(userStore.user.id, promoted_id);
      }
    );
  }

  function emitDemoteUser(channel_id: number, demoted_id: number) {
    refsocket.value.emit(
      "demoted",
      { channel_id, demoted_id },
      (res: boolean) => {
        if (res && currentChan.value)
          currentChan.value.removeAdmin(userStore.user.id, demoted_id);
      }
    );
  }

  function emitKickUser(channel_id: number, kicked_id: number) {
    refsocket.value.emit(
      "kick",
      { channel_id: channel_id, kicked_id: kicked_id },
      (res: boolean) => {
        if (res && currentChan.value) {
          currentChan.value.kickUser(userStore.user.id, kicked_id);
        }
      }
    );
  }

  function emitTypeChange(
    channel_id: number,
    type: TChannelType,
    pass: string
  ) {
    if (type == "pass" && pass) {
      refsocket.value.emit(
        "typeChange",
        { channel_id, type, pass },
        (res: boolean) => {
          if (res && currentChan.value) {
            currentChan.value.changeChannelType(userStore.user.id, type, pass);
          }
        }
      );
    } else {
      refsocket.value.emit(
        "typeChange",
        { channel_id, type },
        (res: boolean) => {
          if (res && currentChan.value) {
            currentChan.value.changeChannelType(userStore.user.id, type, pass);
          }
        }
      );
    }
  }

  function emitPassChange(channel_id: number, pass: string) {
    refsocket.value.emit("passChange", { channel_id, pass }, (res: boolean) => {
      if (res && currentChan.value) {
        currentChan.value.changePass(userStore.user.id, pass);
      }
    });
  }

  function emitRestrictUser(
    isMute: boolean,
    channel_id: number,
    banned_id: number,
    expires: string
  ) {
    
    let dateExpires: Date = new Date(expires);
    let whereToSend: "mute" | "ban" = "ban";

    if (isMute) whereToSend = "mute";
    refsocket.value.emit(
      whereToSend,
      { channel_id: channel_id, banned_id: banned_id, expires: dateExpires },
      (res: boolean) => {
        if (currentChan.value && res)
          currentChan.value.restrictUser(
            userStore.user.id,
            banned_id,
            isMute,
            dateExpires
          );
      }
    );
  }

  function emitJoin(channel_id: number, pass?: string) {
    refsocket.value.emit(
      "join",
      { channel_id: channel_id, pass },
      (res: any) => {
        if (res.status === false) {
          if (res.msg.includes("pass"))
            error.value = `${res.msg}/${channel_id}`;
        } else {
          error.value = "";
          switchJoinedAvailable(channel_id, false);
          getChan(channel_id);
          selectCurrentChan(channel_id);
          router.push(`/chat/room/${channel_id}`);
        }
      }
    );
  }

  function emitQuitChannel(channel_id: number) {
    refsocket.value.emit("quit", { channel_id: channel_id }, (res: any) => {
      if (res) {
        if (switchJoinedAvailable(channel_id, true))
          if (route.params.id == String(channel_id)) router.push("/chat");
      }
    });
  }

  
  function handleMessage(msg: TMessage) {
    if (msg) msg.date = new Date(msg.date);
    if (!msg.isDirect) {
      const index: number = getChanIndex(msg.receiver, false);
      if (index === -1) return;
      openChan.value[index].unBan(msg.sender);
      openChan.value[index].messages.push(msg);
    } else {
      const index: number = getChanIndex(msg.sender, true);
      if (index === -1) return;
      openChan.value[index].messages.push(msg);
    }
  }

  function createCustomMessage(
    admin: number,
    did: string,
    to: number,
    type: number
  ): TMessage {
    if (type > -5) {
      const admin_nick: string =
        admin === userStore.user.id ? "You" : usersStore.getUserNickById(admin);
      const user_nick: string =
        to === userStore.user.id ? "you" : usersStore.getUserNickById(to);

      const msg = `${admin_nick} ` + did + ` ${user_nick} !`;
      return {
        sender: type,
        receiver: to,
        msg,
        isDirect: false,
        date: new Date(),
      };
    } else {
      const user_nick: string =
        admin === userStore.user.id ? "You" : usersStore.getUserNickById(admin);
      const msg = `${user_nick}  ${did} the channel`;
      return {
        sender: type,
        receiver: to,
        msg,
        isDirect: false,
        date: new Date(),
      };
    }
  }

  function handlePromotion(args: {
    promoted_id: number;
    channel_id: number;
    promoted_by: number;
  }) {
    const index: number = getChanIndex(args.channel_id, false);
    if (index == -1) {
      return;
    }
    openChan.value[index].adminList.push(args.promoted_id);
    openChan.value[index].messages.push(
      createCustomMessage(args.promoted_by, "promoted", args.promoted_id, -1)
    );
  }

  function handleBan(args: {
    banned_id: number;
    banned_by: number;
    expires: Date;
    channel_id: number;
  }) {
    const index: number = getChanIndex(args.channel_id, false);
    if (index === -1) {
      return;
    }
    openChan.value[index].banList.push({
      userId: args.banned_id,
      expire: args.expires,
    });
    openChan.value[index].messages.push(
      createCustomMessage(args.banned_by, "banned", args.banned_id, -2)
    );
  }

  function handleMute(args: {
    banned_id: number;
    banned_by: number;
    expires: Date;
    channel_id: number;
  }) {
    const index: number = getChanIndex(args.channel_id, false);
    if (index === -1) {
      return;
    }
    openChan.value[index].muteList.push({
      userId: args.banned_id,
      expire: args.expires,
    });
    openChan.value[index].messages.push(
      createCustomMessage(args.banned_by, "muted", args.banned_id, -3)
    );
  }

  function handleKick(args: {
    kicked_id: number;
    kicked_by: number;
    channel_id: number;
  }) {
    const index: number = getChanIndex(args.channel_id, false);
    if (index === -1) {
      return;
    }

    openChan.value[index].messages.push(
      createCustomMessage(args.kicked_by, "kicked", args.kicked_id, -4)
    );
    if (args.kicked_id == userStore.user.id) {
      if (switchJoinedAvailable(args.channel_id, true))
        if (route.params.id == String(args.channel_id)) router.push("/chat");
    }
    else {
      openChan.value[index].kickUser(args.kicked_by, args.kicked_id);
    }
  }

  function handleJoin(args: { new_client: number; channel_id: number }) {
    const index: number = getChanIndex(args.channel_id, false);
    if (index === -1) {
      return;
    }
    openChan.value[index].userList.push(args.new_client);
    openChan.value[index].messages.push(
      createCustomMessage(args.new_client, "joined", args.channel_id, -5)
    );
  }

  function handleQuit(args: { client_quit: number; channel_id: number }) {
    const index: number = getChanIndex(args.channel_id, false);
    if (index === -1) {
      return;
    }
    openChan.value[index].removeUserFromUserList(args.client_quit);
    openChan.value[index].messages.push(
      createCustomMessage(args.client_quit, "left", args.channel_id, -6)
    );
  }

  function handleTypeChange(args: {
    channel_id: number;
    type: TChannelType;
    user_id: number;
    pass?: string;
  }) {
    const { channel_id, type, user_id, pass } = args;
    const index: number = getChanIndex(args.channel_id, false);
    if (index === -1) {
      return;
    }
    if (
      type != "direct" &&
      type != "pass" &&
      type != "private" &&
      type != "public"
    )
      return;
    openChan.value[index].changeChannelType(user_id, type, pass);
  }

  function handleDemote(arg: {
    channel_id: number;
    demoted_id: number;
    id: number;
  }) {
    const { channel_id, demoted_id, id } = arg;

    const index: number = getChanIndex(channel_id, false);
    if (index === -1) {
      return;
    }
    openChan.value[index].demote(demoted_id);
    openChan.value[index].messages.push(
      createCustomMessage(id, "demoted", demoted_id, -1)
    );
  }

  async function setup() {
    refsocket.value.emit("getMyRooms", (res: boolean | any) => {
      if (res == false) {
        
      } else {
        availableChannels.value = res.availableChannels;
        joinedChannels.value = res.joinedChannels;
      }
    });
    refsocket.value.on("messageSentToChannel", handleMessage);
    refsocket.value.on("directMessageSent", handleMessage);
    refsocket.value.on("typeChanged", handleTypeChange);
    refsocket.value.on("promoted", handlePromotion);
    refsocket.value.on("demoted", handleDemote);
    refsocket.value.on("ban", handleBan);
    refsocket.value.on("kick", handleKick);
    refsocket.value.on("mute", handleMute);
    refsocket.value.on("join", handleJoin);
    refsocket.value.on("quit", handleQuit);
  }
  
  async function getChansLists() {
    loading.value = true;
    try {
      

      setup();
    } catch (error: any) {
      const tempErr = await JSON.parse(error.message);
      error.value = tempErr.body;
    } finally {
      loading.value = false;
    }
  }
  async function getDirectChan(id: number) {
    loading.value = true;
    try {
      const response = await fetch(
        `http://localhost:3000/channels/user/${id}`,
        { credentials: "include" }
      );
      let data: TMessage[];
      if (response.status >= 200 && response.status < 300)
        data = await response.json();
      else
        throw new Error(
          JSON.stringify({
            response: response,
            body: { statusCode: response.status, message: response.statusText },
          })
        );
      if (data) {
        data.forEach((msg) => {
          msg.date = new Date(msg.date);
        });
        let newChan = new CChannel(
          id,
          usersStore.getUserNickById(id),
          "direct",
          "",
          null,
          [id, userStore.user.id],
          [],
          [],
          [],
          data
        );

        openChan.value.push(newChan);
      }
    } catch (error: any) {
      const tempErr = await JSON.parse(error.message);
      error.value = tempErr.body;
    } finally {
      loading.value = false;
    }
  }
  async function getChan(id: number) {
    loading.value = true;
    try {
      const response: Response = await fetch(
        `http://localhost:3000/channels/${id}`,
        { credentials: "include" }
      );
      let data: IChannel;
      if (response.status >= 200 && response.status < 300)
        data = await response.json();
      else
        throw new Error(
          JSON.stringify({
            response: response,
            body: { statusCode: response.status, message: response.statusText },
          })
        );
      if (data) {
        const chanIndex = joinedChannels.value.find((el) => el.id == data.id);
        const alreadyOpen = openChan.value.find((el) => el.getId() == data.id);
        if (chanIndex != undefined && alreadyOpen == undefined) {
          let newChan = new CChannel(
            data.id,
            data.ChanName,
            data.type,
            data.pass || "",
            data.owner,
            data.userList,
            data.adminList,
            data.banList,
            data.muteList,
            data.messages
          );
          if (data.messages) {
            data.messages.forEach((msg) => {
              msg.date = new Date(msg.date);
            });
          }
          openChan.value.push(newChan);
        }
      }
    } catch (error: any) {
      const tempErr = await JSON.parse(error.message);
      error.value = tempErr.body;
    } finally {
      loading.value = false;
    }
  }
  async function createChan(newChan: IChannel): Promise<boolean> {
    if (newChan.id) {
      joinedChannels.value.push({
        name: newChan.ChanName,
        id: newChan.id,
      });
      if (newChan.type == "pass") emitJoin(newChan.id, newChan.pass);
      else emitJoin(newChan.id);
      return true;
    }
    return false;
  }

  
  function isChanInList(id: number): boolean {
    return openChan.value.find((el) => el.getId() == id) ? true : false;
  }

  
  function selectCurrentChan(id: number, isDirect: boolean) {
    if (!isChanInList(id)) return;
    let found = undefined
    if (isDirect)
        found = openChan.value.find((el) => el.getType() == "direct" && el.getId() == id);
    else
        found = openChan.value.find((el) => el.getType() != "direct" && el.getId() == id);
    if (found) currentChan.value = found;
  }
  function unselectCurrentChan() {
    currentChan.value = null;
  }
  function getChanListForSideBar(
    isJoin: boolean
  ): { id: string; name: string }[] {
    let list: { id: string; name: string }[] = [];
    if (isJoin) {
      joinedChannels.value.forEach((el: IChannelRestrict) => {
        list.push({
          name: el.name,
          id: `/chat/room/${el.id}`,
        });
      });
    } else {
      availableChannels.value.forEach((el: IChannelRestrict) => {
        list.push({
          name: el.name,
          id: `/chat/room/${el.id}`,
        });
      });
    }
    return list;
  }
  function getUsersInChannel(): number[] {
    if (currentChan.value) {
      return currentChan.value.getUserList();
    }
    return [];
  }

  return {
    
    availableChannels,
    joinedChannels,
    openChan,
    
    currentChan,
    loading,
    error,
    getChansLists,
    getDirectChan,
    getChan,
    createChan,
    selectCurrentChan,
    unselectCurrentChan,
    getUsersInChannel,
    getChanListForSideBar,
    
    emitMessage,
    emitDirectMessage,
    emitPromoteUser,
    emitDemoteUser,
    emitKickUser,
    emitTypeChange,
    emitPassChange,
    emitRestrictUser,
    emitJoin,
    emitQuitChannel,
  };
});
