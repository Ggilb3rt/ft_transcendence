import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/LoginView.vue"
import TwoFactorAuth from "@/views/TwoFactorAuthView.vue"
import DashOther from "@/views/DashOtherView.vue";
import Chat from "@/views/ChatView.vue";
import Channel from "@/views/ChannelView.vue"

import path from "path";
import { useUsersStore } from "@/stores/users";
import { setStatus, useUserStore } from "@/stores/user";
import { useChannelsStore } from "@/stores/channels";
import { useStatusStore } from "@/stores/status";


type gameList = "pong" | "catPong"

const ourGames: gameList = 'pong';


const Dashboard = () => import("@/views/DashboardView.vue")

const Game = () => import("@/views/GameView.vue")
const FisrtConnection = () => import("@/views/FirstConnection.vue")

function goToDisconnect() {
  const userStore = useUserStore()

  if (userStore.connected)
    return ( {name: "home"} )
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/:lobby?",
      name: "home",
      component: HomeView,
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      beforeEnter: [goToDisconnect]
    },
    {
      path: "/2fa",
      name: "2fa",
      component: TwoFactorAuth
    },
    {
      path: "/chat",
      name: "chat",
      component: Chat,
      children: [
        {
          name: "channel",
          path: 'room/:id',
          props: (route) => ({ direct:false, channelId: route.params.id}),
          component: Channel
        },
        {
          name: "channelDirect",
          path: 'room/direct/:id',
          props: (route) => ({ direct:true, channelId: route.params.id}),
          component: Channel
        }
      ]
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/user/:id",
      name: "dashOther",
      component: DashOther,
    },
    {
      path: "/game/:type/:level/:roomId?", 
      name: "game",
      component: Game,
    },
    {
      path: "/first",
      name: "first",
      component: FisrtConnection,
    },
    {
      path: '/:pathMatch(.*)*',
      name: "notFound",
      redirect: '/'
    }
  ],
});


router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  userStore.loading = true

  try {
    const res = await fetch(`http://localhost:3000/auth/verify`, {
			method: 'GET',
			credentials: "include",
		})
    const {status} = await res.json();
    userStore.conStatus = status
    if (status == setStatus.first_co && to.name != "first") {
      return { name: "first" }
    }
    else if (res.status == 412 || userStore.conStatus == setStatus.need2fa && to.name != "2fa") {
      return { name: "2fa"}
    }
    else if (userStore.conStatus == setStatus.needLogin && to.name != 'login') {
      return { name: 'login' }
    }
  } catch(err) {
    return {name: 'login'}
  }
})

router.beforeEach(async (to, from) => {
  if (to.name == "dashOther") {
    const usersStore = useUsersStore()

    usersStore.getOtherUser(Number(to.params.id))
    if (usersStore.error)
      return false
  }
  return true
})

export default router;
