<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, onMounted } from "@vue/runtime-core";
import Loader from '../components/navigation/loader.vue';
import router from "../router";
import { setStatus, useUserStore } from "@/stores/user"
import { useUsersStore } from "@/stores/users"
import { useStatusStore } from "../stores/status";


//! provoque redirection infini, plus utiliser, on pourra le retirer

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
      if (response.status == 412) {
        userStore.changeStatus(setStatus.need2fa)
        router.push('/2fa')
      }
    else if (response.status >= 200 && response.status < 300) {
        userStore.changeStatus(setStatus.connected)
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
    userStore.error = error.body
    // router.push("/login")
  }
	// redirect to "/"
	// router.push('/')
})

onBeforeUnmount(() => {
	// setTimeout(() => { userStore.loading = false }, 10000)
  userStore.loading = false
})

</script>

<template>
	<div>
		<Loader></Loader>
	</div>
</template>