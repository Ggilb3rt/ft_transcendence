import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/LoginView.vue"
import TwoFactorAuth from "@/views/TwoFactorAuthView.vue"
import DashOther from "@/views/DashOtherView.vue";
import Chat from "@/views/ChatView.vue";
import Channel from "@/views/ChannelView.vue"
// import Success from "@/views/SuccessView.vue"
import path from "path";
import { useUsersStore } from "@/stores/users";
import { setStatus, useUserStore } from "@/stores/user";
import { useStatusStore } from "@/stores/status";


type gameList = "pong" | "catPong"

const ourGames: gameList = 'pong';
// const Chat = () => import("@/views/ChatView.vue")
// const Channel = () => import("@/views/ChannelView.vue")
const Dashboard = () => import("@/views/DashboardView.vue")
// const DashOther = () => import("@/views/DashOtherView.vue")
const Game = () => import("@/views/GameView.vue")

function goToDisconnect() {
  const userStore = useUserStore()

  if (userStore.connected)
    return ( {name: "home"} )
}

function isConnectionOk(to: any, from: any) {
  const userStore = useUserStore()

  if (to.name == 'success' && userStore.connected && (from.name == "2fa" && userStore.twoFactorAuth) )
    console.log("success route")
  else
    return ( {name: "login"} )
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
    // {
    //   path: "/success",
    //   name: "success",
    //   component: Success,
    //   // beforeEnter: [isConnectionOk]
    // },
    {
      path: "/2fa",
      name: "2fa",
      component: TwoFactorAuth
    },
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/AboutView.vue"),
    // },
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
      // children: [
      //   {
      //     path: ":id",
      //     name: "dashOther",
      //     component: DashOther
      //   }
      // ]
    },
    {
      path: "/user/:id",
      name: "dashOther",
      component: DashOther,
    },
    {
      path: "/game/:ourGames?/:id?",
      name: "game",
      component: Game,
    },
    // {
    //   // cf https://router.vuejs.org/guide/essentials/named-views.html
    //   path: "/chat/room",
    //   name: "chat2",
    //   components: {
    //     default: Chat,
    //     channelList,
    //     friendsList
    //   }
    // }
    {
      path: '/:pathMatch(.*)*',
      name: "notFound",
      redirect: '/'
    }
  ],
});


//! need to add a canAccess global guad naviguation with token

// ? -1 == non, 0 == OK, 1 == 2FA
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  //console.log("Before each premiere ligne \n", "from == ", from.path, "\n\nto == ", to.path)
  userStore.loading = true

  try {
  const res = await fetch(`http://localhost:3000/auth/verify`, {
			method: 'GET',
			credentials: "include",
		})

    const {status} = await res.json();
    userStore.conStatus = status
    if (res.status == 412 || userStore.conStatus == setStatus.need2fa && to.name != "2fa") {
      console.log('userStore.conStatus === ', userStore.conStatus)
      return { name: "2fa"}
    }
    else if (userStore.conStatus == setStatus.needLogin && to.name != 'login') {
      console.log('userStore.conStatus je need login === ', userStore.conStatus)
      return { name: 'login' }
    }
  } catch(err) {
    return {name: 'login'}
  }
  // return { name: to.name}
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
