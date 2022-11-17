<script setup lang="ts">
import { ref} from "vue"
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import BtnChallenge from '../navigation/BtnChallenge.vue';

const userStore = useUserStore()
const usersStore = useUsersStore()
const inviteSend = ref<boolean>(false)

function befriend() {
    if (usersStore.user) {
        userStore.addFriend(usersStore.user.id)
        inviteSend.value = true
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
        <div class="invite" v-if="usersStore.user && userStore.user.id != usersStore.user.id && !userStore.isBanBy(usersStore.user.id)">
            <button @click="befriend()" v-if="!userStore.isFriends(usersStore.user.id)">Be friends</button>
            <button @click="userStore.removeFriendOrBan(usersStore.user.id)" v-else>UnFriend</button>
            <button @click="userStore.addBan(usersStore.user.id)" v-if="!userStore.isBan(usersStore.user.id)">Ban !</button>
            <button @click="userStore.removeFriendOrBan(usersStore.user.id)" v-else>UnBan</button>
            
            <BtnChallenge :user-id="usersStore.user.id"></BtnChallenge>
        </div>
    </div>
</template>

<style>

</style>