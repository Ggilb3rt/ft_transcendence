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

const userStatus: status = ref("disconnected")

// function print_statut(id: number) {
//     console.log("statut in link user \n", userStatus)
// }
// const userStatus: status = ref(usersStore.getUserStatus(props.otherUser.id))

// il me faudrait plutôt un watch ici pour regarder le moindre changement sur le socket
// watch()

function filterStatus(id: number): status {
    // console.log("filterStatus start ", usersStore.socketStatus)
    if (usersStore.socketStatus) {
        for (let i = 0; i < usersStore.socketStatus.length; i++) {
            if (usersStore.socketStatus[i].userId == id) {
                // console.log("good old for loop ", usersStore.socketStatus[i].userStatus)
                return usersStore.socketStatus[i].userStatus
            }
        }
        // usersStore.socketStatus.forEach(el => {
        //     if (el.userId == id) {
        //         console.log("user ids", el.userStatus)
        //         return "available"
        //     }
        // })
        // console.log(usersStore.socketStatus)
        // const ret = usersStore.socketStatus
        // const ret = usersStore.socketStatus.values.filter((el: any) => el.id[0] == props.otherUser.id);
        // console.log("filter status ", ret)
        // if (ret.length > 0)
        //     return ret
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