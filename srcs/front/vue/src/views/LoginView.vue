<script setup lang="ts">
import type { IUser } from "../../types"
import { ref } from "vue"
import router from "@/router";
import { useUserStore } from '../stores/user';


// const users = useUsersStore()
const user = useUserStore()
const { getUser } = user
const selectedUser = ref(1)

async function selectUser(e: Event) {
    e.preventDefault()
    console.log(selectedUser)
    await getUser(selectedUser.value);
    router.push("/")
}

</script>

<template>
    <div>
        <p v-if="user.loading">Loading user...</p>
        <p v-if="user.error">{{ user.error.message }}</p>
        <h1>Select your user with his id</h1>
        <form @keypress.enter="selectUser($event)">
            <input type="number" v-model="selectedUser">
            <input type="submit" @keypress.enter="selectUser($event)" @click="selectUser($event)">
        </form>
    </div>
</template>
