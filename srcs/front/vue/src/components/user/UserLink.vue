<script setup lang="ts">
import type { IOtherUserRestrict, status, ISocketStatus } from '@/types'
import { useUsersStore } from '@/stores/users';
import { useStatusStore } from '@/stores/status';
import { watch, ref } from 'vue';

const props = defineProps<{
    otherUser: IOtherUserRestrict | null,
    removeImg?: boolean,
    removeStatus?: boolean
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
    <router-link :to="{ name: 'dashOther', params: { id: otherUser.id }}" v-if="otherUser">
        <div :class="filterStatus(otherUser.id)" class="status-container" v-if="!removeStatus">
        </div>
            <img 
            :src="otherUser.avatar_url" :alt="otherUser.nickname + ' avatar'"
            v-if="!removeImg"
        >
        <p>{{ otherUser.nickname }}</p>
    </router-link>
</template>

<style scoped>
.status-container {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 15;
}

a {
    display: block;
}

img {
    max-width: 100%;
}

p { text-align: center; }

</style>