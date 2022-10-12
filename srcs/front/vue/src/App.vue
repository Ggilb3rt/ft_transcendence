<script setup lang="ts">
import { onBeforeMount, ref, onUpdated, onBeforeUpdate } from "vue"
import type { IUser, status } from "../types"
import { RouterLink, RouterView } from "vue-router";
import router from "./router";
import { useUsersStore } from './stores/users';
import { useUserStore } from './stores/user';
// import HelloWorld from "./components/HelloWorld.vue";
import PrimaryNav from "./components/navigation/PrimaryNav.vue";
import Footer from "./components/Footer.vue";
import { io } from "socket.io-client"


const user = useUserStore()
const users = useUsersStore()

users.getUsers()



// Socket Status

interface IStatus {
    socketId: string;
    userId: number;
    userStatus: status;
}

let alreadyConnect: boolean = false
let socket = io("http://localhost:3000", {autoConnect: false});
const statusList = ref<IStatus[]>([])

onBeforeUpdate(() => {
  if (user.connected && socket.disconnected && !alreadyConnect) {
    socket.connect()
  }
  if (socket.connected && !alreadyConnect) {
    socket.emit("connectionStatus", [user.user.id], (res: any) => {
      statusList.value = res
      console.log("connectionStatus", statusList.value)
    })
    
    socket.on("newConnection", (res: IStatus) => {
      statusList.value.push(res)
      console.log("update connection", statusList.value)
    })
    socket.on("newDisconnection", (res: any) => {
      console.log(res)
      statusList.value.splice(statusList.value.findIndex((el: IStatus) => el.socketId == res.socketId), 1)
      console.log("update disconnection", statusList.value)
    })
    alreadyConnect = true
  }
})


// if user is connected put user store on localStorage and getUsers again

console.log(router.currentRoute.value)

</script>

<template>
  <main>
    <header v-if="router.currentRoute.value.path != '/login'">
      <img alt="Pong logo" class="logo" src="@/assets/logo.svg" />
      <PrimaryNav></PrimaryNav>
    </header>

    <RouterView />

    <Footer v-if="router.currentRoute.value.path != '/login'"></Footer>
  </main>
</template>

<style scoped>
header {
  display: flex;
  flex-direction: row-reverse;
  place-items: center;
  justify-content: right;
  gap: 30px;
  line-height: 1.5;
  max-height: 90px;
  border-bottom: 1px solid;
  background: #000;
  /* margin-bottom: 30px; */
}

.logo {
  display: block;
  width: 100px;
  height: 100px;
  /* margin: 0 auto 2rem; */
}

/* .userAvatar {
  height: 50px;
  width: 50px;
  border-radius: 50px;
} */
/* 
nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
} */

@media screen and (min-width: 1024px) {

  header {
  }
  header .wrapper {
    /* display: flex;
    place-items: flex-start;
    flex-wrap: wrap; */
  }


}

@media screen and (min-width: 768px) {
  header {
    flex-direction: row;
    justify-content: space-between;
    /* padding-right: calc(var(--section-gap) / 2); */
  }

  nav {
    text-align: right;
    /* margin-left: -1rem; */
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

</style>
