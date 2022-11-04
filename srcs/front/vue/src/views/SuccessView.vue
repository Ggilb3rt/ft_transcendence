<script setup lang="ts">
import { useUserStore } from "@/stores/user"
import { useUsersStore } from "@/stores/users"
import { onBeforeMount, onBeforeUnmount, onMounted } from "@vue/runtime-core";
import Loader from '../components/navigation/Loader.vue';
import router from "../router";
import { useStatusStore } from "../stores/status";


const userStore = useUserStore()
const usersStore = useUsersStore()
const statusStore = useStatusStore()


onBeforeMount(() => {
	userStore.loading = true
})

onMounted(async () => {
	// setup the stores
	try {
    await fetch(`http://localhost:3000/auth/verify`, {credentials: "include"})
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json()
      }
      throw new Error(response.statusText)
    })
    .then((data) => {
        userStore.user = data
        userStore.user.avatar_url = `http://localhost:3000/users/${userStore.user.id}/avatar`
        userStore.error = null
        userStore.connected = true
        usersStore.getUsers()
        statusStore.setup(userStore.user.id);
        router.push('/')
    })
  } catch (error: any) {
    userStore.error = error
    router.push("/login")
  }
	// redirect to "/"
	// router.push('/')
})

onBeforeUnmount(() => {
	userStore.loading = false
})

</script>

<template>
	<div>
		<Loader></Loader>
	</div>
</template>