<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { ref } from "vue";
import { useUsersStore } from '@/stores/users';
import { classPrivateMethod } from "@babel/types";

const users = useUsersStore();
const togglable = ref(true);
let	isActive = ref(false);

let winWidth = ref(window.innerWidth)

window.addEventListener('resize', (e) => {
	console.log(e);
	winWidth.value = window.innerWidth
});

</script>

<template>
	<div class="side-menu-container">
		<button @click="isActive = (togglable && isActive) ? false : true" v-if="winWidth < 768">
			<span v-if="!isActive">Menu</span>
			<span v-else>X</span>
		</button>
		<nav :class="{open: isActive, side_menu: winWidth < 768}" class="side-left">
			<button @click="isActive = (togglable && isActive) ? false : true" v-if="winWidth < 768">
				<span v-if="!isActive">Menu</span>
				<span v-else>X</span>
			</button>
			<RouterLink to="/">Home</RouterLink>
			<RouterLink to="/about">About</RouterLink>
			<RouterLink to="/game">Game</RouterLink>
			<RouterLink to="/dashboard">
				<img v-if="users.user" :src="users.user.avatar_url" :alt="users.user.nickname + ' avatar'" class="userAvatar">
				<span v-else>Account</span>
			</RouterLink>
		</nav>
	</div>
</template>

<style scoped>

.side_menu {
	position: fixed;
	top: 0;
	bottom: 0;
	z-index: 50;
	background: #000;
	color: #fff;
	width: 300px;
	display: flex;
	flex-direction: column;
	transition: all .3s ease-in-out;
	margin-top: 0;
}

.side_menu.side-left {
	left: calc(-50% - 300px);
}

.side_menu.side-left.open {
	border-right: 1px solid #fff;
	left: 0;
}

.side_menu.side-right {
	right: -300px;
	border-left: 1px solid #fff;
}

.side_menu.side-right.open {
	right: 0;
}

.userAvatar {
  height: 50px;
  width: 50px;
  border-radius: 50px;
}

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
  /* border-left: 1px solid var(--color-border); */
}

nav a:first-of-type {
  border: 0;
}



@media (min-width: 768px) {
	/* .side-menu-container {
		display: none;
	} */

	nav {
	text-align: right;
	/* margin-left: -1rem; */
	font-size: 1rem;
	padding: 1rem 0;
	margin-top: 1rem;
	}
}

</style>