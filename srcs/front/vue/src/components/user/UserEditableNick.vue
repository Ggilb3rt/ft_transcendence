<script setup lang="ts">
import { ref, watch } from 'vue'
import { mande } from 'mande';
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import Loader from '../navigation/loader.vue';

const userStore = useUserStore()
const usersStore = useUsersStore()

const props = defineProps<{
    noHeroName?: boolean,
}>()

// Nickname management
// const maxNickLength = Number(process.env.MAX_NICK_LENGTH)
const maxNickLength = 30
let editMode = ref(false)
let nicknameEdit = ref("")

function filteredNames() {
	return usersStore.userList.filter((el) => el.nickname === nicknameEdit.value)
}

function freeNick(newNick: string): boolean {
	return filteredNames().length > 0 ? false : true
}

async function validNickChange(newNick: string) {
	if (freeNick(newNick) && (newNick.length > 0 && newNick.length <= maxNickLength)) {
		try {
			const api = mande(`http://localhost:3000/users/nick`);
			await api.post({
				nickname: newNick
			})
			.then((data) => {
				//console.log('data from change nick', data)
			})
		} catch (error: any) {
			//console.log('change nick err', JSON.stringify(error))
			userStore.error = error.body
			return
		}
		userStore.setUserNick(newNick)
		usersStore.changUserNick(userStore.user.id, newNick)
		editMode.value = false
	}
}

function removeSpecialChar(newNick: string) {
	return newNick.replace(/([ `{})(\]\[="':;.,/\\])/g, "")
}

watch(nicknameEdit, () => {
	nicknameEdit.value = removeSpecialChar(nicknameEdit.value)
})

</script>

<template>
	<div>
		<p v-if="!noHeroName" class="heroName">{{ userStore.user.first_name }} {{ userStore.user.last_name}}</p>
		<div class="heroTag">
			<Loader></Loader>
			<div v-if="editMode">
				<span>
					<input
						type="text"
						v-model="nicknameEdit"
						:placeholder="userStore.user.nickname"
						@keyup.esc="editMode = !editMode"
						@keypress.enter="validNickChange(nicknameEdit)"
					>
				</span>
				<button @click="editMode = !editMode">X</button>
				<button @click="validNickChange(nicknameEdit)" :class="{cant_click: (filteredNames().length || nicknameEdit.length > maxNickLength)}">Change</button>
				<p v-if="filteredNames().length && nicknameEdit.length">Can't choose this nick</p>
				<p v-if="nicknameEdit.length > maxNickLength">Too long</p>
			</div>
			<p v-else>
				<a href="#" rel="nofollow">{{ userStore.getUserNick() }}</a>
				<button @click="editMode = !editMode">Edit</button>
			</p>
		</div>
	</div>
</template>