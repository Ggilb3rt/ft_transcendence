<script setup lang="ts">
import {
  ref,
  onUpdated,
  onBeforeUpdate,
  watch,
  onMounted,
  onBeforeMount,
} from "vue";
import type { Ref } from "vue";
import type { IUser, TStatus, ISocketStatus } from "../types";
import { RouterLink, RouterView, useRoute } from "vue-router";
import router from "./router";
import { io } from "socket.io-client";
import { useUsersStore } from "./stores/users";
import { setStatus, useUserStore } from "./stores/user";
import { useStatusStore } from "./stores/status";
import { useChannelsStore } from "./stores/channels";
// import HelloWorld from "./components/HelloWorld.vue";
import Footer from "./components/Footer.vue";
import PrimaryNav from "./components/navigation/PrimaryNav.vue";
import ErrorPopUp from "./components/ErrorPopUp.vue";
import ModalChallenge from "@/components/ModalChallenge.vue"
import Loader from "./components/navigation/loader.vue";

//! Deux problèmes :
// problème important : il est necessaire de cliquer deux fois sur connection pour se connecter
// la première fois qu'on arrive on est pas connecter donc redirigé sur /login ==> erreur se print (pas userFriendly mais pas génant non plus)

const route = useRoute()
const channelStore = useChannelsStore()
const userStore = useUserStore()
const usersStore = useUsersStore()
const statusStore = useStatusStore()
let isSetupStoreChannel = false


async function testConnection() {
  try {
    console.log("Test Connection premiere ligne == ", userStore.conStatus)
    // userStore.loading = true
  if (userStore.conStatus == setStatus.connected || userStore.conStatus == setStatus.first_co) {
    const response = await fetch(`http://localhost:3000/users/current`, {credentials: "include"})
    localStorage.clear();
    var data;
    if (response.status >= 200 && response.status < 300) {
        userStore.changeStatus(setStatus.connected)
        data = await response.json()
    }
    else {
      throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
    }
    if (data) {
        userStore.getUser(data)
        userStore.error = null
        userStore.connected = true
        usersStore.getUsers()
        console.log('userStore.id = ', userStore.user.id)
        statusStore.setup(userStore.user.id);
        if (!isSetupStoreChannel) {
          channelStore.getChansLists();
          isSetupStoreChannel = true
        }
      }
  }
  } catch (error: any) {
    // maintenant ca marche avec le reload mais en fait c'est chiant parceque ca print une erreur à la 1er connection
    const tempErr = JSON.parse(error.message);
    userStore.error = tempErr.body;
  } finally {
    userStore.loading = false
    console.log("end of testConnection")
  }
}

router.beforeResolve(async (to) => {
    await testConnection();
        if (to.name == "game" ) {
      //console.log(newRoute.name)
      // change my status by 'inGame' and emit it
      //console.log("in watch route user id should be 9 == ", userStore.user.id)
      statusStore.changeCurrentUserStatus("inGame", userStore.user.id);
      //console.log("should be inGame")
    } 
    return true
})

window.addEventListener('beforeunload', (e) => {
  statusStore.refuseChallenge(userStore.user.id)
  statusStore.onClose()
  // const res = await fetch('http://localhost:3000/auth/verify', {
  //   credentials: "include"
  // })
  // console.log("res == ", res);
  // if (res.status < 300) {
  //   if (userStore.conStatus == setStatus.connected) {
  if (route.name)
    localStorage.setItem('last_page', route.name.toString());
    // }
  // }
  // localStorage.setItem('log', res.toString());
})

// Socket Status
watch(route, (newRoute) => {
  // console.log(route.matched)
  if (usersStore.socketStatus) {
    if (newRoute.name != 'game') {
      if (statusStore.status == "inGame")
        statusStore.changeCurrentUserStatus("available", userStore.user.id);
    }
  }
});

onMounted(() => {
  userStore.loading = false
})
</script>

<template>
  <main>
    <ErrorPopUp></ErrorPopUp>

    <header
      v-if="
        router.currentRoute.value.path != '/login' &&
        router.currentRoute.value.path != '/2fa'
      "
    >
      <img alt="Pong logo" class="logo" src="@/assets/logo.svg" />
      <PrimaryNav></PrimaryNav>
    </header>

    <ModalChallenge></ModalChallenge>

    <div v-if="userStore.loading">
      <Loader></Loader>
    </div>
    <RouterView v-else />

    <!-- <Footer v-if="router.currentRoute.value.path != '/login'"></Footer> -->
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
