import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Dashboard from "../views/DashboardView.vue";
import Game from "../views/GameView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
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
      path: "/dashboard",
      name: "dashboard",
      component: Dashboard,
    },
    {
      path: "/game",
      name: "game",
      component: Game,
    },
    // {
      // cf https://router.vuejs.org/guide/essentials/named-views.html
    //   path: "/chat",
    //   name: "chat",
    //   components: {
    //     default: chatView,
    //     channelList,
    //     friendsList
    //   }
    // }
    {
      path: '/:pathMatch(.*)*', redirect: '/'
    }
  ],
});

export default router;
