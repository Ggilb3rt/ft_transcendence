<script setup lang="ts">
import { ref, onBeforeUpdate, watch } from "vue"
import type { status, ISocketStatus } from "../types"
import { RouterLink, RouterView, useRoute } from "vue-router";
import router from "./router";
import { io } from "socket.io-client"

import { useUsersStore } from './stores/users';
import { useUserStore } from './stores/user';

import PrimaryNav from "./components/navigation/PrimaryNav.vue";
import ErrorPopUp from "./components/ErrorPopUp.vue";

const userStore = useUserStore()
const users = useUsersStore()
const route = useRoute()



//!!!!!!!! il serait très sexy de pouvoir ctrl + r sans avoir à refaire le processus de connection
// on pourrai avoir une route dans le back à checker au lancement de l'app vue, si le cookie est present
// et pas 2FA ==> set userStore.connected à true puis router.push(from) (ex: http://pongLocal/dashboard/2 ==> si cookie valide et pas 2FA recharge direct cette page (pas de retour à login))
// sinon go login (parceque flemme de faire un autre sytème)


async function testConnection() {
  try {
    socket.emit('testConnection')
    await fetch(`http://localhost:3000/auth/verify`, {
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
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json()
      }
      throw new Error(response.statusText)
    })
    .then((data) => {
      if (data) {
        userStore.user = data
        userStore.user.avatar_url = `http://localhost:3000/users/${userStore.user.id}/avatar`
        userStore.error = null
        userStore.connected = true
        users.getUsers()
        router.push('/')
      }
    })
  } catch (error: any) {
    userStore.error = error
  }
}

// if (userStore.connected)
//   testConnection()


// Socket Status

// ici j'utilise une var en double que je watch ici pour update une copie dans le store. Je devrai le faire direct dans le store
//!!!!!!!!!!!! factoriser dès que ca marche avec "inGame"
// je vais aussi devoir trouver un moyen pour se connecter au socket directement (sans etre obliger de trigger onBeforeUpdate une fois)

let alreadyConnect = ref<boolean>(false)
let socket
const statusList = ref<ISocketStatus[]>([])

onBeforeUpdate(() => {
if (userStore.user.nickname === 'ptroger') {
  console.log("jesuis ici ptroger")
  socket = io("http://localhost:3000/usersStatus", {autoConnect: false});
}
else {
  console.log("jesuis la test")
  socket = io("http://localhost:3000/test", {autoConnect: false})
}
})

onBeforeUpdate(() => {
  if (userStore.connected && socket.disconnected && !alreadyConnect.value) {
    socket.connect()
  }
  if (socket.connected && !alreadyConnect.value) {
    socket.emit("connectionStatus", userStore.user.id, (res: any) => {
      statusList.value = res
      console.log("connectionStatus", statusList.value)
    })
    
    socket.on("newStatusConnection", (res: ISocketStatus) => {
      statusList.value.push(res)
      console.log("update connection", statusList.value)
    })
    socket.on("newStatusDisconnection", (res: ISocketStatus) => {
      // console.log(res)
      statusList.value.splice(statusList.value.findIndex((el: ISocketStatus) => el.socketId == res.socketId), 1)
      console.log("update disconnection", statusList.value)
    })
    socket.on("newStatusChange", (res: ISocketStatus) => {
      console.log("onCHangeStatus", res)
      const changedIndex = statusList.value.findIndex((el) => el.socketId == res.socketId)
      if (changedIndex != -1)
        statusList.value[changedIndex].userStatus = res.userStatus
    })
    alreadyConnect.value = true
  }

watch(statusList, (newStatusList) => {
    // console.log("watcher before setSocket\n", newStatusList[0].userStatus, oldStatusList)
    if (users.socketStatus) {
      users.setSocket(newStatusList)
    }
  })
})

function getCurrentUserStatus(): status {
  for (const key in statusList.value) {
    if (Object.prototype.hasOwnProperty.call(statusList.value, key)) {
      const el = statusList.value[key];
      if (el.userId === userStore.user.id) {
        return el.userStatus
      }
    }
  }
  return "disconnected"
}

function changeCurrentUserStatus(newStatus: status) {
  for (const key in statusList.value) {
    if (Object.prototype.hasOwnProperty.call(statusList.value, key)) {
      const el = statusList.value[key];
      console.log(el.userId, userStore.user.id)
      if (el.userId === userStore.user.id) {
        el.userStatus = newStatus
        if (socket.connected)
          socket.emit("changeStatus", el)
        console.log("watch", el)
        break
      }
    }
  }
}

watch(route, (newRoute) => {
  console.log(route.matched)
  if (users.socketStatus) {
    if (newRoute.name == "game") {
      console.log(newRoute.name)
      // change my status by 'inGame' and emit it
      changeCurrentUserStatus("inGame")
      console.log("should be inGame")
    }
    else {
      if (getCurrentUserStatus() == "inGame")
        changeCurrentUserStatus("available")
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
