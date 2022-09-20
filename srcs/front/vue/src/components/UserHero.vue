<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUsersStore } from '../stores/users';
import UserGameStats from './UserGameStats.vue'
import UserList from './UserList.vue'
import type { IUser } from '../../types';

const users = useUsersStore()
const { getUserNick } = useUsersStore()
// const { getUserNick } = storeToRefs(users) // make getUserNick has a ref ==> reactive

console.log(UserList)

</script>

<template>
  <div>
    <div v-for="user in users.userList" :key="user.id" class="heroCard">
      <br>
      <img class="heroAvatar" :src="user.avatar_url" :alt="user.nickname + ' avatar'" />
      <p class="heroName">{{ user.first_name }} {{ user.last_name}}</p>
      <p class="heroTag">
        <a href="#">{{ getUserNick(user) }}</a>
      </p>
      <UserGameStats :id="user.id" />

      <UserList title="Friends" :user="user" :list="user.friends"></UserList>
      <UserList title="Block" :user="user" :list="user.blocks" ></UserList>

    </div>
  </div>
</template>

<style>
.heroCard p {
  font-family: "Inder", sans-serif;
  font-style: normal;
  font-weight: 400;
}

.heroCard .heroAvatar {
  max-width: 40%;
  border-radius: 10px;
}

.heroCard .heroName {
  font-size: 24px;
  line-height: 30px;
}

.heroCard .heroTag {
  font-size: 15px;
  line-height: 19px;
}
</style>
