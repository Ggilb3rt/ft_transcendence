<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUsersStore } from '../stores/users';
import type { IUser } from '../../types';

const props = defineProps<{
	title: string,
	user: IUser,
	list: number[]
}>()

const users = useUsersStore()


function removeFriend(user: IUser, friend: number) {
	// need changes when get just one user
	// find a way to remove only from one array
  users.userList.forEach( (el) => {
    if (el.id == user.id ) {
      user.friends.forEach( (id: number, index: number) => {
        if (id == friend)
          if (confirm(`Remove ${id} from your friends ?`))
            user.friends.splice(index, 1)
      })
    }
	if (el.id == user.id ) {
      user.blocks.forEach( (id: number, index: number) => {
        if (id == friend)
          if (confirm(`Remove ${id} from your blocks ?`))
            user.blocks.splice(index, 1)
      })
    }
  })
}
</script>

<template>
	<div>
		<h2>{{ props.title }}</h2>
		<div v-for="el in props.list" :key="el">
			id: {{ el }}
			<button @click="removeFriend(user, el)">Remove</button>
		</div>
	</div>
</template>