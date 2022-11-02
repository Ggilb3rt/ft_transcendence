<script setup lang="ts">
import type { IUser } from "../types"
import { ref } from "vue"
import router from "@/router";
import { useUserStore } from '../stores/user';

import io from "socket.io-client";
const socket = io("http://localhost:3000/game", {query: {
    connType: "general"
}});
socket.on("testingz", (data) => {
    console.log(data);
})

async function testingz() {
    try {
        await fetch(`http://localhost:3000/gamepage`, {
        method: "GET",
        });
    }
    catch (error: any) {
    console.log(error)
    }
}


// const users = useUsersStore()
const user = useUserStore()
const { getUser } = user
const selectedUser = ref(1)

function selectUser(e: Event) {
    e.preventDefault()
    console.log(selectedUser)
    getUser(selectedUser.value);
    router.push("/")
}

</script>

<template>
    <h1>Select your user with his id</h1>
    <form @keypress.enter="selectUser($event)">
        <input type="number" v-model="selectedUser">
        <input type="submit" @click="selectUser($event)">
    </form>

</template>
