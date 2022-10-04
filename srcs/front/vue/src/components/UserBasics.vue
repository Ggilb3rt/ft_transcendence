<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import { useUsersStore } from '@/stores/users';
import UserInvite from './UserInvite.vue'
import Loader from './navigation/loader.vue';
import { mande } from 'mande';
import { file } from '@babel/types';


const userStore = useUserStore()
const usersStore = useUsersStore()
const api = mande(`http://localhost:3000/users/${userStore.user.id}/nick`);

let editMode = ref(false)
const maxNickLength = 10
let nicknameEdit = ref("")
// let nameList: string[] = [];
// usersStore.userList.forEach((el) => {nameList.push(el.nickname)})

// function filteredNames() {
// 	return nameList.filter((name) => name === (nicknameEdit.value))
// }

function filteredNames() {
  return usersStore.userList.filter((el) => el.nickname === nicknameEdit.value)
}

function freeNick(newNick: string): boolean {
  return filteredNames().length > 0 ? false : true
  // for (let i = 0; i != nameList.length; i++) {
	// 	if (nameList[i] == newNick)
	// 		return false
	// }
	// return true
}

async function validNickChange(newNick: string) {
	if (freeNick(newNick) && (newNick.length > 0 && newNick.length <= maxNickLength)) {
		// await server validation
		try {
			await api.post({
				nickname: newNick
			})
			.then((data) => {
				console.log('data from change nick', data)
			})
		} catch (error) {
			console.log('change nick err', error)
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



let editImg = ref("")
let MIMEtypeError = ref(false)

function validMIMEtype(file: any): boolean {
  if (file === undefined)
    return false
  const validMIMEtype = ["image/jpeg", "image/png", "image/gif", "image/svg+xml", "image/webp", "image/avif", "image/apng"]
  const fileMIME = file.type

  if (fileMIME.split('/')[0] != "image")
    return false
  for (const key in validMIMEtype) {
    if (validMIMEtype[key] == fileMIME)
      return true
  }
  return false
}

function changeImg(e: any) {
	if (e) {
		let formData = new FormData();
		const img = e.target.files[0]
    // const fileField = document.getElementById("changeAvatar") // img == fileField.files[0] (cf console.log plus bas)

    // formData.append('avatar', fileField.files[0]);
    formData.append('avatar', img);
    
    MIMEtypeError.value = false
    if (!validMIMEtype(img)) {
      MIMEtypeError.value = true
      return
    }

		confirm("Change your avatar ?" + img)
    // console.log(formData)
    // console.log(img)
    // console.log(fileField.files[0])


    for (const [key, value] of formData) {
      console.log(key, value)
    }
		// must send to server and wait his response with the server url
      // update stores with new avatar_url
      // userStore.setUserAvatar()
	}
}


/* find on mozilla fetch page
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#uploading_a_file

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
            <p v-if="MIMEtypeError" class="red">Invalid file format</p>
        </figure>
        <div>
            <p class="heroName">{{ userStore.user.first_name }} {{ userStore.user.last_name}}</p>
            <div class="heroTag">
                <Loader></Loader>
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
                    <button @click="validNickChange(nicknameEdit)" :class="{cant_click: (filteredNames().length || nicknameEdit.length > maxNickLength)}">Change</button>
                    <p v-if="filteredNames().length && nicknameEdit.length">Can't choose this nick</p>
                    <p v-if="nicknameEdit.length > maxNickLength">Too long</p>
                </div>
                <p v-else>
                    <a href="#">{{ userStore.getUserNick() }}</a>
                    <button @click="editMode = !editMode">Edit</button>
                </p>
              </div>
        </div>
        <UserInvite></UserInvite>
    </div>
</template>

<style>

</style>