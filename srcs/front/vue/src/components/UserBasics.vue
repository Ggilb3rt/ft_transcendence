<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import { useUsersStore } from '@/stores/users';
import UserInvite from './UserInvite.vue'

const userStore = useUserStore()
const usersStore = useUsersStore()


let editMode = ref(false)
let nicknameEdit = ref("")
let nameList: string[] = [];
usersStore.userList.forEach((el) => {nameList.push(el.nickname)}) // need to get it from server

function filteredNames() {
	return nameList.filter((name) => name === (nicknameEdit.value))
}

function freeNick(newNick: string): boolean {
	for (let i = 0; i != nameList.length; i++) {
		if (nameList[i] == newNick)
			return false
	}
	return true
}

function validNickChange(newNick: string) {
	if (freeNick(newNick) && newNick.length > 0) {
		// await server validation
		userStore.setUserNick(newNick)
		editMode.value = false
	}
}

function removeSpecialChar(newNick: string) {
	return newNick.replace(/([ `{})(\]\[="':;.,/\\])/g, "")
}

watch(nicknameEdit, () => {
	nicknameEdit.value = removeSpecialChar(nicknameEdit.value)
})



let editImg = ref("")
function changeImg(e: any) {
	if (e) {
		const img = e.target.files[0]
		let formData = new FormData();
		// formData.append('file', this.file);
		confirm("Change your avatar ?" + img)
		// must send to server and wait his response with the server url
		// userStore.setUserAvatar()
	}
}

</script>

<template>
    <div class="userBasics">
        <figure class="heroFigure">
            <img class="heroAvatar" :src="userStore.getUserAvatar()" :alt="userStore.user.nickname + ' avatar'">
            <input type="file" @change="changeImg( $event )" id="changeAvatar">
        </figure>
        <div>
            <p class="heroName">{{ userStore.user.first_name }} {{ userStore.user.last_name}}</p>
            <p class="heroTag">
                <div v-if="editMode">
                    <span>
                        @<input
                            type="text"
                            v-model="nicknameEdit"
                            :placeholder="userStore.user.nickname"
                            @keyup.esc="editMode = !editMode"
                            @keypress.enter="validNickChange(nicknameEdit)"
                            >
                    </span>
                    <button @click="editMode = !editMode">X</button>
                    <button @click="validNickChange(nicknameEdit)" :class="{cant_click: filteredNames().length}">Change</button>
                    <div v-if="filteredNames().length && nicknameEdit.length">Can't choose this nick</div>
                </div>
                <div v-else>
                    <a href="#">{{ userStore.getUserNick() }}</a>
                    <button @click="editMode = !editMode">Edit</button>
                </div>
            </p>
        </div>
        <UserInvite></UserInvite>
    </div>
</template>

<style>

</style>