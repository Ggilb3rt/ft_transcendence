<script setup lang="ts">
import router from "@/router";
import { onUpdated } from "@vue/runtime-core";
import { useUserStore } from '@/stores/user';
import type { IUserStoreState } from "@/stores/user"
import { useUsersStore } from "@/stores/users";
import type { IUsersStoreState } from "@/stores/users"
import CarbonClose from "@/components/icones-bags/CarbonClose.vue"

const userStore = useUserStore();
const usersStore = useUsersStore();
const stores = [userStore, usersStore]

onUpdated(() => {
	stores.forEach((store) => {
		if (store.error != null) {
			if (store.error.statusCode == 401) {
				console.log("error popup ", store.error.statusCode)
				// if (store.hasOwnProperty("connected"))
				store.connected = false
				// le reset fonctionne pas pour une raison qui m'échappe, mais en vrai c'est pas obligatoire notamment pour garder le message d'erreur
				// store.$reset() 
				router.push('/login')
			}
		}
	})
})

// Error, need to put it in component
function removeError(store: IUserStoreState | IUsersStoreState) {
	if (store.error)
		store.error = null
}

</script>


<template>
	<div class="error" v-if="userStore.error || usersStore.error">
		<div v-for="store in stores" :key="store.$id">
			<p v-if="store.error">{{ store.$id }} : {{ store.error.message }}
				<button @click="removeError(store)">
					<i class="icon_btn">
						<CarbonClose></CarbonClose>
					</i>
				</button>
			</p>
		</div>
	</div>
</template>


<style>
div.error {
	position: fixed;
	z-index: 5;
	padding: 20px;
	top: 0;
	left: 0;
	right: 0;
	color: white;
	background: #FF5555;
	text-align: right;
}

</style>