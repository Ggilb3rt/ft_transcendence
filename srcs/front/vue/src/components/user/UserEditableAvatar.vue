<script setup lang="ts">
import { ref } from 'vue'
import { file } from '@babel/types';
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';

const userStore = useUserStore()
const usersStore = useUsersStore()

// Avatar Management
let MIMEtypeError = ref(false)
let sizeFileError = ref(false)

function validMIMEtype(file: any): boolean {
	if (file === undefined)
		return false
	const validMIMEtype = ["image/jpeg"]
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
	// const maxFilseSize = Number(process.env.MAX_AVATAR_SIZE)
	const maxFilseSize = 3000000

	if (file && file.size <= maxFilseSize)
		return true
	return false
}

async function changeImg(e: any) {
	if (e) {
		let newAvatar = new FormData()
		const img = e.target.files[0]

		newAvatar.append('file', img)
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
		if (!confirm("Change your avatar ?")) {
			return
		}
		try {
			await fetch(`http://localhost:3000/users/avatar`, {
				method: 'POST',
				credentials: "include",
				body: newAvatar,
			})
				.then((response) => {
					if (response.status >= 200 && response.status < 300)
						return response
					throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
				})
				.then((data) => {
					if (data) {
						const fileReader = new FileReader()
						fileReader.readAsDataURL(img)
						fileReader.onload = () => {
							if (fileReader.result)
								userStore.user.avatar_url = fileReader.result
						}
						// usersStore.changeUserAvatar(userStore.user.id, data.url)
					}
				})
		} catch (error: any) {
			const tempErr = JSON.parse(error.message);
    		userStore.error = tempErr.body;
		}
	}
}
</script>

<template>
	<figure class="heroFigure">
		<img class="heroAvatar" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'">
		<input type="file" @change="changeImg( $event )" id="changeAvatar" accept="image/jpeg,.jpeg,.jpg">
		<p v-if="MIMEtypeError" class="red">Invalid file format</p>
		<p v-if="sizeFileError" class="red">File size must be &lt= 3Mo</p>
	</figure>
</template>