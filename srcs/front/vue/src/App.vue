<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useUsersStore } from './stores/users';
// import HelloWorld from "./components/HelloWorld.vue";
import PrimaryNav from "./components/navigation/PrimaryNav.vue";
import Footer from "./components/Footer.vue";


const users = useUsersStore();


</script>

<template>
  <main>
    <header>
      <img
      alt="Pong logo"
      class="logo"
      src="@/assets/logo.svg"
      width="125"
      height="125"
      />
      
      <PrimaryNav></PrimaryNav>

    </header>

    <RouterView />

    <Footer></Footer>
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
  max-height: 100vh;
  border-bottom: 1px solid;
  background: #000;
  /* margin-bottom: 30px; */
}

.logo {
  display: block;
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

@media (min-width: 1024px) {

  header {
  }
  header .wrapper {
    /* display: flex;
    place-items: flex-start;
    flex-wrap: wrap; */
  }


}

@media (min-width: 768px) {
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
