<script setup lang="ts">
import type { IOtherUserRestrict, status, ISocketStatus } from '@/types'
import { useUsersStore } from '@/stores/users';
import { useStatusStore } from '@/stores/status';
import { watch, ref } from 'vue';

const props = defineProps<{
    otherUser: IOtherUserRestrict | null,
    removeImg?: boolean,
    removeStatus?: boolean,
    removeName?: boolean,
    removeHover?: boolean
}>()

const usersStore = useUsersStore()
const statusStore = useStatusStore()

const userStatus: status = ref("disconnected")

function filterStatus(id: number): status {
    if (statusStore.statusList) {
        // je pourrai utiliser un find ici
        for (let i = 0; i < statusStore.statusList.length; i++) {
            if (statusStore.statusList[i].userId == id)
                return statusStore.statusList[i].userStatus
        }
    }
    return "disconnected"
}

</script>

<template>
    <router-link 
        v-if="otherUser"
        class="user-link"
        :class="{hoverable: !removeHover}"
        :to="{ name: 'dashOther', params: { id: otherUser.id }}"
        :title="'go to ' + otherUser.nickname"
    >
        <div :class="filterStatus(otherUser.id)" class="status-container" v-if="!removeStatus">
        </div>
            <img 
            :src="otherUser.avatar_url" :alt="otherUser.nickname + ' avatar'"
            v-if="!removeImg"
        >
        <p v-if="!removeName">{{ otherUser.nickname }}</p>
    </router-link>
</template>

<style>
.user-link .status-container {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 15;
}

.user-link{
    display: block;
}

.user-link img {
    width: 100%;
    max-width: 100px;
    max-height: 100px;
    object-fit: cover;
}

.user-link p { text-align: center; }

@media screen and (hover: hover) {
    .user-link:hover.hoverable {
        transform: scale(1.05);
    }
}

</style>