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
import Footer from "./components/Footer.vue";
import PrimaryNav from "./components/navigation/PrimaryNav.vue";
import ErrorPopUp from "./components/ErrorPopUp.vue";
import ModalChallenge from "@/components/ModalChallenge.vue";
import Loader from "./components/navigation/loader.vue";

const route = useRoute()
const channelStore = useChannelsStore()
const userStore = useUserStore()
const usersStore = useUsersStore()
const statusStore = useStatusStore()
let isSetupStoreChannel = false


async function testConnection() {
  try {
  if (userStore.conStatus == setStatus.connected || userStore.conStatus == setStatus.first_co) {
    const response = await fetch(`http://localhost:3000/users/current`, {credentials: "include"})
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
        statusStore.setup(userStore.user.id);
        if (!isSetupStoreChannel) {
          channelStore.getChansLists();
          isSetupStoreChannel = true;
        }
      }
    }
  } catch (error: any) {
    const tempErr = JSON.parse(error.message);
    userStore.error = tempErr.body;
  } finally {
    userStore.loading = false
  }
}

router.beforeResolve((to) => {
  testConnection()
    return true;
})

onMounted(() => {
  userStore.loading = false;
});
</script>

<template>
  <main>
    <ErrorPopUp
      v-if="
        router.currentRoute.value.path != '/login' &&
        router.currentRoute.value.path != '/2fa' &&
        router.currentRoute.value.path != '/first'
      "
    ></ErrorPopUp>

    <header
      v-if="
        router.currentRoute.value.path != '/login' &&
        router.currentRoute.value.path != '/2fa' &&
        router.currentRoute.value.path != '/first'
      "
    >
    <RouterLink to="/">
      <img alt="Pong logo" class="logo" src="@/assets/logo.svg" />
    </RouterLink>
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

@media screen and (min-width: 1024px) {

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
