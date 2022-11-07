<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { ref } from 'vue'
  import { useUsersStore } from '@/stores/users';
  import type { IUser } from '../../types';
  import { mande } from 'mande';

  const userHomer = useUsersStore()
  const { user, loading, error } = storeToRefs(userHomer) // is reactive
  const { getUsers } = userHomer // is not reactive
  const api = mande('http://localhost:3000/users');
  
  getUsers()

  let userBDD = {
    first_name: "guillaume",
    last_name: "gilbert",
    nickname: "ggilbert",
    avatar_url: "/src/assets/avatars/"
    }
  function postDataBase(userBDD: any) {
    api.post({userBDD}).then((userBDD) => {
      userBDD =  {
        first_name: "",
        last_name: "",
        nickname: "",
        avatar_url: "",
        nick_fourtytwo: "lol"
    }
    })
  }

</script>

<template>
  <div class="vue_wrapper about">
    <div class="load-error">
      <p v-if="loading">Loading contacts...</p>
      <p v-if="error">{{ error.message }}</p>
    </div>
    <h1>This is an about page</h1>
    <div v-if="user">
      <p>User {{ user.first_name }} is <span v-if="!user.two_factor_auth">not</span> an admin</p>
      <input v-model="user.first_name" placeholder="edit me" />
    </div>
    <br>
    <div>
      <h2>Create and post user</h2>
      <!-- <input type="number" v-model="userData.id" placeholder="id">
      <input type="text" v-model="userData.name" placeholder="name">
      <input type="text" v-model="userData.tag" placeholder="tag">
      <button @click="postUser(userData)">Create user</button> -->
      <input type="text" v-model="userBDD.first_name" placeholder="firstname">
      <input type="text" v-model="userBDD.last_name" placeholder="lastname">
      <input type="text" v-model="userBDD.nickname" placeholder="nickname">
      <input type="text" v-model="userBDD.avatar_url" placeholder="avatar url">

      <button @click="postDataBase(userBDD)">Create user</button>
    </div>
  </div>
</template>

<style>
@media screen and (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
.load-error {
  background: rgba(255, 10, 10, .4);
  padding: 10px;
  color: white;
}
</style>
