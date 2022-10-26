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

async function connection42() {
    try {
    await fetch(`http://localhost:3000/auth/`, {
      method: "GET",
      credentials: "include",
    })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json()
      }
      throw new Error(response.statusText)
    })
    .then((data) => {
      console.log("login data ", data)
    })
  } catch (error: any) {
    console.log(error)
  }
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


        <h1>Connection with 42</h1>
        <a href="http://localhost:3000/auth" class="btn">Connection with 42</a>
        <button @click="connection42()">Connection 42</button>
    </div>
</template>
