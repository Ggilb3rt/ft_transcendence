import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Dashboard from "../views/DashboardView.vue";
import Game from "../views/GameView.vue";
import Chat from "../views/ChatView.vue";
import Chat2 from "../views/ChatView2.vue";
import Login from "../views/LoginView.vue"
import DashOther from "@/views/DashOtherView.vue";
import TwoFactorAuth from "@/views/TwoFactorAuthView.vue"
import path from "path";
import { useUsersStore } from "@/stores/users";
import { useUserStore } from "@/stores/user";

type gameList = "pong" | "catPong"

const ourGames: gameList = 'pong';

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
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/chat",
      name: "chat",
      component: Chat,
      children: [{
        path: 'room/:id',
        component: Chat
      }]
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
      // children: [
      //   {
      //     path: ":id",
      //     name: "dashOther",
      //     component: Login  // create UserOtherHero component
      //   }
      // ]
    },
    {
      path: "/user/:id",
      name: "dashOther",
      component: DashOther,
      // beforeEnter: (to, from) => {
      //   const usersStore = useUsersStore()

      //   console.log(usersStore.user.first_name)
      // }
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
router.beforeEach((to, from) => {
  const userStore = useUserStore()

  if (!userStore.connected && to.name != 'login')
    return { name: 'login' }
  if (userStore.connected && userStore.user.two_factor_auth && !userStore.twoFactorAuth && to.name != "2fa")
    return { name: "2fa" }
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
