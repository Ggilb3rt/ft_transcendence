<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';

const userStore = useUserStore()
const usersStore = useUsersStore()


// async function sendInvite() {
//     console.log(`invitation from ${userStore.user.id} to ${usersStore.user.id}`)
// }

async function challenge() {
    if (usersStore.user && usersStore.socketIsAvailable(usersStore.user.id)) {
        console.log(`challenge from ${userStore.user.id} to ${usersStore.user.id}`)
        // put invitation in a modal in the other side
    }
}
async function goSpectate() {
    if (usersStore.user && !usersStore.socketIsAvailable(usersStore.user.id)) {
        console.log("go to game with user ", usersStore.user.id)
    // fetch gameId from back
    // router.push(/game/${gameId})
    }
}

</script>

<template>
    <div class="userBasics" v-if="usersStore.user">
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
        <div class="invite" v-if="userStore.user.id != usersStore.user.id && !userStore.isBanBy(usersStore.user.id)">
            <button @click="userStore.addFriend(usersStore.user.id)" v-if="!userStore.isFriends(usersStore.user.id)">Be friends</button>
            <button @click="userStore.removeFriendOrBan(usersStore.user.id)" v-else>UnFriend</button>
            <button @click="userStore.addBan(usersStore.user.id)" v-if="!userStore.isBan(usersStore.user.id)">Ban !</button>
            <button @click="userStore.removeFriendOrBan(usersStore.user.id)" v-else>UnBan</button>
            
            <button @click="challenge()" v-if="!userStore.isBan(usersStore.user.id) && usersStore.socketIsAvailable(usersStore.user.id)">Challenge</button>
            <button @click="goSpectate()" v-else-if="!userStore.isBan(usersStore.user.id)">Spectate</button>
        </div>
    </div>
</template>

<style>

</style>