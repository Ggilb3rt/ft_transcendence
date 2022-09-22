<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from '../stores/user';
import type { IUser } from '../../types';

const props = defineProps<{
	title: string,
	user: IUser,
	list: number[]
}>()

const userStore = useUserStore()


function removeFriend(user: IUser, friend: number) {
  // find a way to remove only from one array
  if (userStore.user.friends) {
    userStore.user.friends.forEach( (id: number, index: number) => {
      if (id == friend)
      if (confirm(`Remove ${id} from your friends ?`))
      userStore.user.friends.splice(index, 1)
    })
    userStore.user.blocks.forEach( (id: number, index: number) => {
      if (id == friend)
      if (confirm(`Remove ${id} from your blocks ?`))
      userStore.user.blocks.splice(index, 1)
    })
  }
  
  // need changes when get just one user
  // users.userList.forEach( (el) => {
  //   if (el.id == user.id ) {
  //     user.friends.forEach( (id: number, index: number) => {
  //       if (id == friend)
  //         if (confirm(`Remove ${id} from your friends ?`))
  //           user.friends.splice(index, 1)
  //     })
  //   }
	// if (el.id == user.id ) {
  //     user.blocks.forEach( (id: number, index: number) => {
  //       if (id == friend)
  //         if (confirm(`Remove ${id} from your blocks ?`))
  //           user.blocks.splice(index, 1)
  //     })
  //   }
  // })
}
</script>

<template>
	<div>
		<h1>{{ props.title }}</h1>
    <p v-if="props.list == null || props.list.length == 0">Nobody here</p>
		<div v-for="el in props.list" :key="el">
			id: {{ el }}
			<button @click="removeFriend(user, el)">Remove</button>
		</div>
	</div>
</template>