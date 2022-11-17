<script setup lang="ts">
import { watch } from "vue";
import router from "@/router";
import { useUsersStore } from "@/stores/users";
import { useUserStore } from "@/stores/user";
import UserHero from "@/components/user/UserHero.vue";
import UserGameStats from "@/components/user/UserGameStats.vue"
import UserMatchHistory from "@/components/user/UserMatchHistory.vue";
import UserList from "@/components/user/UserList.vue";
import UserBasicsOther from "@/components/user/UserBasicsOther.vue";
import Loader from "@/components/navigation/loader.vue"
import WatchGameList from "@/components/WatchGameList.vue";

const usersStore = useUsersStore()
const userStore = useUserStore()

</script>

<template>
	<div class="vue_wrapper dashboard" v-if="usersStore.user && !usersStore.loading">
		<h1>Player</h1>
		<div class="heroCard">
		<UserBasicsOther></UserBasicsOther>

		<UserGameStats
			:user="usersStore.user"
			:user-rank="usersStore.getUserRank()"
			:user-win-rate="usersStore.getUserWinRate()"
		/>

			<div v-if="userStore.isFriends(usersStore.user.id)">
				<WatchGameList friends></WatchGameList>
				<UserMatchHistory :user="usersStore.user" />
				<UserList title="Friends" :user="usersStore.user" :list="usersStore.user.friends"></UserList>
			</div>
		</div>
	</div>
	<div v-else-if="usersStore.loading" class="vue_wrapper dashboard">
		<Loader></Loader>
	</div>
	<div v-else class="vue_wrapper dashboard">
		<h1>Nobody here, <router-link to="/">let's pong !</router-link></h1>
		<img src="/src/assets/avatars/mark.jpg" alt="">
		<p v-if="usersStore.error">{{ usersStore.error }}</p>
	</div>
</template>

<style>

</style>
