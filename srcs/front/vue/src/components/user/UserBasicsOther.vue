<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';

const userStore = useUserStore()
const usersStore = useUsersStore()


async function sendInvite() {
    console.log(`invitation from ${userStore.user.id} to ${usersStore.user.id}`)
}

async function challenge() {
    // need to check if users are connected and available
    console.log(`challenge from ${userStore.user.id} to ${usersStore.user.id}`)
    // put invitation in a modal in the other side
}

async function ban() {
    if (userStore.user.ban_users_ban_users_idTousers.includes(usersStore.user.id))
        return

    // send data to server and get res
    const res = true
    if (res) {
        userStore.user.ban_users_ban_users_idTousers.push(usersStore.user.id)
    }
    console.log(`ban from ${userStore.user.id} to ${usersStore.user.id}`)
}

</script>

<template>
    <div class="userBasics">
        <figure class="heroFigure">
            <img class="heroAvatar" :src="usersStore.user.avatar_url" :alt="usersStore.user.nickname + ' avatar'">
        </figure>
        <div>
            <p class="heroName">{{ usersStore.user.first_name }} {{ usersStore.user.last_name}}</p>
            <div class="heroTag">
                <div>
                    <a href="#" rel="nofollow">{{ usersStore.user.nickname }}</a>
                </div>
            </div>
        </div>
        <div class="invite" v-if="userStore.user.id != usersStore.user.id">
            <button @click="sendInvite()" v-if="!userStore.isFriends(usersStore.user.id)">Be friends</button>
            <button @click="userStore.removeFriendOrBan(usersStore.user.id)" v-else>UnFriend</button>
            <button @click="ban()" v-if="!userStore.isBan(usersStore.user.id)">Ban !</button>
            <button @click="userStore.removeFriendOrBan(usersStore.user.id)" v-else>UnBan</button>
            <button @click="challenge()" v-if="!userStore.isBan(usersStore.user.id)">Challenge</button>
        </div>
    </div>
</template>

<style>

</style>