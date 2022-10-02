import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Dashboard from "../views/DashboardView.vue";
import Game from "../views/GameView.vue";
import Chat from "../views/ChatView.vue";
import Chat2 from "../views/ChatView2.vue";
import Login from "../views/LoginView.vue"
import DashOther from "@/views/DashOtherView.vue";
import path from "path";


type gameList = 'pong' | 'catPong'

const ourGames: gameList = 'pong';

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
      component: Login
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
      path: "/dashboard/:id",
      name: "dashOther",
      component: DashOther // create UserOtherHero component
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

export default router;
