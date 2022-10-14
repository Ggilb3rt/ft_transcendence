<script setup lang="ts">
import type { IOtherUserRestrict, status, ISocketStatus } from '@/types'
import { useUsersStore } from '@/stores/users';
import { watch, ref } from 'vue';

const props = defineProps<{
    otherUser: IOtherUserRestrict | null,
    removeImg?: boolean,
    removeStatus?: boolean
}>()

const usersStore = useUsersStore()

const userStatus: status = "available"
// const userStatus: status = ref(usersStore.getUserStatus(props.otherUser.id))

// il me faudrait plutôt un watch ici pour regarder le moindre changement sur le socket
// watch()

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