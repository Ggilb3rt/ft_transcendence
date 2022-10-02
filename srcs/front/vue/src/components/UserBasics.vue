<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import { useUsersStore } from '@/stores/users';
import UserInvite from './UserInvite.vue'
import { mande } from 'mande';


const userStore = useUserStore()
const usersStore = useUsersStore()
const api = mande(`http://localhost:3000/${userStore.user.id}/nick`);

let editMode = ref(false)
let nicknameEdit = ref("")
let nameList: string[] = [];
usersStore.userList.forEach((el) => {nameList.push(el.nickname)})

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

async function validNickChange(newNick: string) {
	if (freeNick(newNick) && newNick.length > 0) {
		// await server validation
		// try {
		// 	await api.post({
		// 		nickname: newNick
		// 	})
		// 	.then((data) => {
		// 		console.log('data from change nick', data)
		// 	})
		// } catch (error) {
		// 	console.log('change nick err', error)
		// }
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


/* find on mozilla fetch page
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

const formData = new FormData();
const fileField = document.querySelector('input[type="file"]');

formData.append('username', 'abc123');
formData.append('avatar', fileField.files[0]);

fetch('https://example.com/profile/avatar', {
  method: 'PUT',
  body: formData
})
  .then((response) => response.json())
  .then((result) => {
    console.log('Success:', result);
  })
  .catch((error) => {
    console.error('Error:', error);
  });




*/





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