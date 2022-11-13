<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { onBeforeMount, onBeforeUnmount, ref } from "vue";
import router from "@/router/index"
import { useUserStore } from '@/stores/user';
import ModalSearch from "../ModalSearch.vue";
import { classPrivateMethod } from "@babel/types";
import UserBtnCancelChallenge from "../user/UserBtnCancelChallenge.vue";
import IconSupport from "@/components/icons/IconSupport.vue"
import CarbonClose from "@/components/icones-bags/CarbonClose.vue"
import CarbonLogout from "@/components/icones-bags/CarbonLogout.vue"

const userStore = useUserStore();
let	isActive = ref(false);

let winWidth = ref(window.innerWidth)

// Disconnection, need to put it in component
async function disconnect() {
	try {
		const response = await fetch(`http://localhost:3000/auth/logout`, {credentials: "include"})
		var data;
		if (response.status >= 200 && response.status < 300) {
			data = await response.json()
		}
		else {
			throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
		}
		if (data) {
			userStore.connected = false
			userStore.twoFactorAuth = false
			router.push("/login")
		}
	} catch (error: any) {
		const tempErr = JSON.parse(error.message);
		userStore.error = tempErr.body;
	}
}


function updateWinWidthValue(e: Event) {
	winWidth.value = window.innerWidth
}

onBeforeMount(() => {
	window.addEventListener('resize', (e) => updateWinWidthValue(e));
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', (e) => updateWinWidthValue(e))
})

</script>

<template>
	<div class="side-menu-container">
		<button class="btn-menu" @click="isActive = (isActive) ? false : true" v-if="winWidth < 768">
			<div v-if="!isActive">
				<span class="bar ping"></span>
				<span class="bar ball"></span>
				<span class="bar pong"></span>
			</div>
			<span v-else>
				<i class="btn_icon">
					<CarbonClose></CarbonClose>
				</i>
			</span>
		</button>
		<nav :class="{open: isActive, side_menu: winWidth < 768}" class="side-left">
			<button class="btn-menu" @click="isActive = (isActive) ? false : true" v-if="winWidth < 768">
				<div v-if="!isActive">
					<span class="bar ping"></span>
					<span class="bar ball"></span>
					<span class="bar pong"></span>
				</div>
				<span v-else>
					<i class="icon_btn">
						<CarbonClose></CarbonClose>
					</i>
				</span>
			</button>
			<RouterLink to="/" @click="isActive = false">Play</RouterLink>
			<RouterLink to="/chat" @click="isActive = false">Chat</RouterLink>
			<!-- <RouterLink to="/game" @click="isActive = false">Game</RouterLink> -->
			<RouterLink to="/dashboard" @click="isActive = false">
				<img v-if="userStore.user" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'" class="userAvatar">
				<span v-else>Account</span>
			</RouterLink>
			<UserBtnCancelChallenge></UserBtnCancelChallenge>
			<ModalSearch></ModalSearch>
			<button @click="disconnect()" title="disconnect">
				<i class="icon_btn">
					<CarbonLogout></CarbonLogout>
				</i>
			</button>
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

.btn-menu {
	position: relative;
	width: 50px;
	height: 50px;
	padding: 10px;
	background: none;
	border: 3px solid #fff;
	color: #fff;
	align-self: flex-end;
	/* transition: all .2s ease-in-out; */
}
.bar {
	display: block;
	width: 60%;
	height: 3px;
	background: #fff;
	margin: 5px;
}
.bar:first-child {
	margin: 3px 5px 5px;
}

.btn-menu:hover .ping {
	animation: ping 2s infinite alternate ease-out;
}

.btn-menu:hover .pong {
	animation: pong 2s infinite alternate ease-in-out;
}

.btn-menu:hover .ball {
	animation: ball 2s infinite alternate ease-in;
}



.userAvatar {
  height: 60px;
  width: 60px;
  border-radius: 60px;
  object-fit: cover;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  /* margin-top: 2rem; */
  display: flex;
  align-items: center;
  /* justify-content: center; */
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  height: 4rem;
  line-height: 4rem;
  font-size: 1.5rem;
  /* border-left: 1px solid var(--color-border); */
}

nav a:first-of-type {
  border: 0;
}

@media screen and (max-width: 490px) {
	.side_menu {
		width: 100%;
	}
}

@media screen and (min-width: 768px) {
	/* .side-menu-container {
		display: none;
	} */

	nav {
	text-align: right;
	/* margin-left: -1rem; */
	font-size: 1rem;
	/* padding: 1rem 0; */
	/* margin-top: 1rem; */
	}

	nav a {
		font-size: 1rem;
	}
}



@keyframes ping {
  0% {}
  25% {
    transform: rotate(90deg) translateY(15px);
  }
  50% {
    transform: rotate(90deg) translateY(15px) translateX(-5px);
  }
  75% {
    transform: rotate(90deg) translateY(15px) translateX(0px);
  }
	100% {
		transform: rotate(90deg) translateY(15px) translateX(7px);
	}
}

@keyframes pong {
  0% {}
  25% {
    transform: rotate(-90deg) translateY(15px);
  }
  50% {
    transform: rotate(-90deg) translateY(15px) translateX(10px);
  }
  75% {
    transform: rotate(-90deg) translateY(15px) translateX(0px);
  }
	100% {
		transform: rotate(-90deg) translateY(15px) translateX(20px);
	}
}

@keyframes ball {
  0% {
		width: 60%;
  }
  25% {
    width: 20%;
  }
  50% {
		width: 20%;
    transform: translateX(16px) translateY(-5px);
	}
  100% {
		width: 20%;
    transform: translateX(-7px);
	}
}


</style>