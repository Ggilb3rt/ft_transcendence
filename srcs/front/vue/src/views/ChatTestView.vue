<script>
import io from "socket.io-client";

export default {
    name: "ChatTest",
    data() {
        return {
            title: "Websocket Tester",
            username: "",
            text: "",
            messages: {
                general: [],
                typescript: [],
                nestjs: [],
            },
            socket: {chat: null, alerts: null},
            activeRoom: 'general',
            rooms: {
               general: false,
               typescript: false,
               nestjs: false,
            },
            

        }
    },
    methods: {
        sendChatMessage() {
            //Check if user is member of active room

            if (this.isMemberofActiveRoom) {
                this.socket.chat.emit('chatToServer', { sender: this.username, message: this.text, room: this.activeRoom }); 
                this.text = '';
            } else {
                alert("You must be a member of the active room to send messages !");
            }

            //console.log(`send: ${this.text}`);
            //this.socket.emit('msgToServer', this.text);
            //this.messages.push(this.text);
        },
        receiveChatMessage(msg) {
            //console.log(`recv: ${msg}`);
            this.messages[msg.room].push(msg);

        },
        toggleRoomMembership() {
            if (this.isMemberofActiveRoom) {
                this.socket.chat.emit('leaveRoom', this.activeRoom);
            } else {
                this.socket.chat.emit('joinRoom', this.activeRoom);
            }
        }
    },
    computed: {
        // Computed getter
        isMemberofActiveRoom() {
            return this.rooms[this.activeRoom];
        },
        
    },
    created() {
        this.username = prompt("Enter your username: ");
        
        this.socket.chat = io("http://localhost:3000/chat"); //exemple avec un namespace apres le /. attention: ce n'est pas un path !! c'est un namespace
        this.socket.chat.on('chatToClient', (msg) => {
            this.receiveChatMessage(msg);
        });

        this.socket.chat.on('connect', () => {
            this.toggleRoomMembership()
        });

        this.socket.chat.on('joinedRoom', (room) => {
            this.rooms[room] = true;
        });

        this.socket.chat.on('leftRoom', (room) => {
            this.rooms[room] = true;
        });
    }
}
</script>

<template>
  <div id="chat">
    <h1>{{ title }}</h1>
    <form>
        <input v-model="text" type="text" />
        <button type="submit" @click.prevent="sendChatMessage">Send</button>
    </form>
    <div class="tab-row">
        <button class="tab-btn" :class="{ active: activeRoom == 'general' }" @click="activeRoom = 'general'">General</button>
        <button class="tab-btn" :class="{ active: activeRoom == 'typescript' }" @click="activeRoom = 'typescript'">Typescript</button>
        <button class="tab-btn" :class="{ active: activeRoom == 'nestjs' }" @click="activeRoom = 'nestjs'">Nestjs</button>
    </div>
    <div class="tab-row">
        Status: {{ isMemberofActiveRoom ? 'Joined' : 'NOT Joined' }} <button @click="toggleRoomMembership()"> {{ isMemberofActiveRoom ? 'Leave' : 'Join'}}</button>
    </div>
    <p>
        <ul>
            <li v-for="msg of messages[activeRoom]">
            <strong>{{ msg.sender }}:</strong> {{ msg.message }}</li>
        </ul>
    </p>        
    </div>
</template>

<style>
   

</style>
