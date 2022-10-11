<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import UserInvite from './UserInvite.vue'
import Loader from '../navigation/loader.vue';
import { mande } from 'mande';
import { file } from '@babel/types';


const userStore = useUserStore()
const usersStore = useUsersStore()

let editMode = ref(false)

const maxNickLength = 10
let nicknameEdit = ref("")

function filteredNames() {
	return usersStore.userList.filter((el) => el.nickname === nicknameEdit.value)
}

function freeNick(newNick: string): boolean {
	return filteredNames().length > 0 ? false : true
}

async function validNickChange(newNick: string) {
	if (freeNick(newNick) && (newNick.length > 0 && newNick.length <= maxNickLength)) {
		// await server validation
		try {
			const api = mande(`http://localhost:3000/users/${userStore.user.id}/nick`);
			await api.post({
				nickname: newNick
			})
			.then((data) => {
				console.log('data from change nick', data)
			})
		} catch (error: any) {
			console.log('change nick err', error)
      userStore.error = error
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


// Avatar Management
let MIMEtypeError = ref(false)
let sizeFileError = ref(false)

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

function validFileSize(file: any): boolean {
  const maxFilseSize = 3000000

  if (file && file.size <= maxFilseSize)
    return true
  return false
}

async function changeImg(e: any) {
	if (e) {
		let newAvatar = new FormData()
		const img = e.target.files[0]
    // const fileField = document.getElementById("changeAvatar") // img == fileField.files[0] (cf console.log plus bas)

    // newAvatar.append('avatar', fileField.files[0]);
    newAvatar.append('avatar', img)
    
    MIMEtypeError.value = false
    if (!validMIMEtype(img)) {
      MIMEtypeError.value = true
      return
    }
    sizeFileError.value = false
    if (!validFileSize(img)) {
      sizeFileError.value = true
      return
    }

    if (!confirm("Change your avatar ?" + img)) {
      return
    }
    // console.log(newAvatar)
    // console.log(img)
    // console.log(`fileField`, fileField.files[0])


    for (const [key, value] of newAvatar) {
      console.log(key, value)
    }
		// must send to server and wait his response with the server url
    try {
			const api = mande(`http://localhost:3000/users/${userStore.user.id}/avatar`);
			await api.post({
				avatar: newAvatar
			})
			.then((data) => {
				console.log('data from change avatar ', data)
        // need to put setUserAvatar(data) and changeUserAvatar(..) here
			})
		} catch (error: any) {
			console.log('change avatar err', error)
      userStore.error = error
      // return
		}
    const servRes = "/src/assets/avatars/default.gif"
    // update stores with new avatar_url
    userStore.setUserAvatar(servRes)
    usersStore.changeUserAvatar(userStore.user.id, servRes)
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
            <p v-if="sizeFileError" class="red">File size must be &lt= 3Mo</p>
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