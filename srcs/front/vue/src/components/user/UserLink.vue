<script setup lang="ts">
import type { IOtherUserRestrict, status } from '@/types'

const props = defineProps<{
    otherUser: IOtherUserRestrict | null,
    removeImg?: boolean,
    removeStatus?: boolean
}>()


const userStatus: status = "available"

</script>

<template>
    <router-link :to="{ name: 'dashOther', params: { id: otherUser.id }}" v-if="otherUser">
        <div :class="userStatus" class="status-container" v-if="!removeStatus">
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

</style>