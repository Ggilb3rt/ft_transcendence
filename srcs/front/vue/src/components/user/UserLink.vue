<script setup lang="ts">
import type { IOtherUserRestrict, status } from '@/types'

const props = defineProps<{
    otherUser: IOtherUserRestrict | null,
    removeImg?: boolean
}>()


const userStatus: status = "disconnected"

</script>

<template>
    <router-link :to="{ name: 'dashOther', params: { id: otherUser.id }}" v-if="otherUser" :class="userStatus">
        <img 
            :src="otherUser.avatar_url" :alt="otherUser.nickname + ' avatar'"
            v-if="!removeImg"
        >
        <p>{{ otherUser.nickname }}</p>
    </router-link>
</template>

<style scoped>



a {
    display: block;
}

img {
    max-width: 100%;
}

</style>