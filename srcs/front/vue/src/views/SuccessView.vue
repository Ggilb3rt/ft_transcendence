<script setup lang="ts">
import { useUserStore } from "@/stores/user"
import { useUsersStore } from "@/stores/users"
import { onBeforeMount, onBeforeUnmount, onMounted } from "@vue/runtime-core";
import Loader from '../components/navigation/loader.vue';
import router from "../router";


const userStore = useUserStore()
const usersStore = useUsersStore()

onBeforeMount(() => {
	userStore.loading = true
})

onMounted(async () => {
	// setup the stores
	try {
    await fetch(`http://localhost:3000/auth/authenticate`, {
      method: "GET",
      headers: {
        // Accept: 'application/json',
        credentials: "include",
		// AccessControlAllowOrigin: "http://localhost:3000"
        // Authorization: "Bearer "
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
	// redirect to "/"
	router.push('/')
})

onBeforeUnmount(() => {
	userStore.loading = false
})

</script>

<template>
	<div>
		empty
		<Loader></Loader>
	</div>
</template>