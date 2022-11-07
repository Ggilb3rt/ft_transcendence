<script setup lang="ts">
import { ref, onUpdated, onBeforeUpdate, watch, onMounted, onBeforeMount } from "vue"
import type { Ref } from "vue"
import type { IUser, TStatus, ISocketStatus } from "../types"
import { RouterLink, RouterView, useRoute } from "vue-router";
import router from "./router";
import { io } from "socket.io-client"
import { useUsersStore } from './stores/users';
import { setStatus, useUserStore } from './stores/user';
import { useStatusStore } from './stores/status'
// import HelloWorld from "./components/HelloWorld.vue";
import Footer from "./components/Footer.vue";
import PrimaryNav from "./components/navigation/PrimaryNav.vue";
import ErrorPopUp from "./components/ErrorPopUp.vue";
import ModalChallenge from "@/components/ModalChallenge.vue"



const route = useRoute()
const userStore = useUserStore()
const users = useUsersStore()
const statusStore = useStatusStore()


window.addEventListener('beforeunload', async (e) => {
  statusStore.refuseChallenge(userStore.user.id)
  statusStore.onClose()
  const res = await fetch('http://localhost:3000/auth/verify', {
    credentials: "include"
  })
  console.log("res == ", res);
  if (res.status < 300) {
    if (userStore.conStatus == setStatus.connected) {
      localStorage.setItem('last_page', route.name.toString());
    }
  }
  localStorage.setItem('log', res.toString());
})

async function testConnection() {
  try {
    console.log("Test Connection premiere ligne")
    const response = await fetch(`http://localhost:3000/auth/verify`, {
      method: "GET",
      // mode: "cors",
      credentials: "include",
      headers: {
        // Accept: 'application/json',
        // credentials: "include",
        // Authorization: "Bearer " + lecookie,
        // AccessControlAllowOrigin: "http://localhost"

        // Cookie: document.cookie
        //! au final les autres requettes integrent le cookie...
      }
    })
    // localStorage.clear();
    var data;
    if (response.status == 412) {
        userStore.changeStatus(setStatus.need2fa)
        router.push('/2fa')
      }
    else if (response.status >= 200 && response.status < 300) {
        userStore.changeStatus(setStatus.connected)
        data = await response.json()
    }
    else {
      throw new Error(response.statusText)
    }
    if (data) {
        userStore.user = data
        userStore.user.avatar_url = `http://localhost:3000/users/${userStore.user.id}/avatar`
        userStore.error = null
        userStore.connected = true
        users.getUsers()
        console.log('userStore.id = ', userStore.user.id)
        statusStore.setup(userStore.user.id);
      }
  } catch (error: any) {
    userStore.error = error.body
  }
}

// if (userStore.connected)
  testConnection()


// Socket Status

// ici j'utilise une var en double que je watch ici pour update une copie dans le store. Je devrai le faire direct dans le store
//!!!!!!!!!!!! factoriser dès que ca marche avec "inGame"
// je vais aussi devoir trouver un moyen pour se connecter au socket directement (sans etre obliger de trigger onBeforeUpdate une fois)

watch(route, (newRoute) => {
  console.log(route.matched)
  if (users.socketStatus) {
    if (newRoute.name == "game") {
      console.log(newRoute.name)
      // change my status by 'inGame' and emit it
      console.log("in watch route user id should be 9 == ", userStore.user.id)
      statusStore.changeCurrentUserStatus("inGame", userStore.user.id)
      console.log("should be inGame")
    }
    else {
      if (statusStore.status == "inGame")
        statusStore.changeCurrentUserStatus("available", userStore.user.id)
    }
  }
})

</script>

<template>
	<main>
		<ErrorPopUp></ErrorPopUp>

		<header v-if="router.currentRoute.value.path != '/login' && router.currentRoute.value.path != '/2fa'">
			<img alt="Pong logo" class="logo" src="@/assets/logo.svg" />
			<PrimaryNav></PrimaryNav>
		</header>

		<RouterView />

		<ModalChallenge></ModalChallenge>


		
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
