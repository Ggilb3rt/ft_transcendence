<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import UserLink from "./UserLink.vue";
import type { IUser, IOtherUser } from '@/types'

const props = defineProps<{
	title: string,
	user: IUser | IOtherUser,
	list: number[],
  canEdit?: boolean
}>()

const userStore = useUserStore()
const usersStore = useUsersStore()
let toggleList = ref(true)

function removeFriend(user: IUser | IOtherUser, friend: number) {
  // find a way to remove only from one array (with a props sending the type of the list ?)
  if (userStore.user.friends && userStore.user.ban_users_ban_users_idTousers) {
    userStore.user.friends.forEach( (id: number, index: number) => {
      if (id == friend)
        if (confirm(`Remove ${id} from your friends ?`))
          userStore.user.friends.splice(index, 1)
          // send info to back
    })
    userStore.user.ban_users_ban_users_idTousers.forEach( (id: number, index: number) => {
      if (id == friend)
        if (confirm(`Remove ${id} from your ban_users_ban_users_idTousers ?`))
          userStore.user.ban_users_ban_users_idTousers.splice(index, 1)
          // send info to back
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
  //     user.ban_users_ban_users_idTousers.forEach( (id: number, index: number) => {
  //       if (id == friend)
  //         if (confirm(`Remove ${id} from your ban_users_ban_users_idTousers ?`))
  //           user.ban_users_ban_users_idTousers.splice(index, 1)
  //     })
  //   }
  // })
}

function filterUsers() {
  return usersStore.userList.filter((user) => props.list.find(el => el === user.id))
}

</script>

<template>
	<div class="listOfUsers">
		<h1 
      @click="toggleList = !toggleList"
      :class="{
            triangleUp: toggleList && props.list.length != 0,
            triangleDown: !toggleList && props.list.length != 0}"
    >{{ props.title }}</h1>
    <p v-if="props.list == null || props.list.length == 0">Nobody here</p>
    <div class="usersInList" :class="{hide: !toggleList }">
      <div v-for="el in filterUsers()" :key="el.id" class="userInList">
        <UserLink :other-user="el"></UserLink>
        <button v-if="canEdit" @click="removeFriend(user, el.id)">X</button>
      </div>
    </div>
	</div>
</template>

<style>

.usersInList {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	text-align: center;
  /* use for hide animation cf in UserMatchHistory to*/
  max-height: 200vh;
  height: auto;
  transform: scaleY(1);
  transition: all .5s ease-out;
  /* don't known if needed */
}

/* Need an update, cf dashboard when hover*/
.listOfUsers .usersInList .userInList button {
	position: absolute;
	top: -5px;
	right: -5px;
  z-index: 16;
	color: #fff;
	background: var(--global-c-red);
	border: 1px solid var(--global-c-red-hover);
	display: none;
}

.listOfUsers .usersInList .userInList:hover button{
	display: block;
}
.listOfUsers .usersInList .userInList img{
	width: 100px;
}

</style>