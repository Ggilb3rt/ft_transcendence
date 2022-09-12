<script setup lang="ts">
  import TheWelcome from "@/components/TheWelcome.vue";
  import { storeToRefs } from 'pinia';
  import { useUserStore } from '@/stores/users';
  
  const userHomer = useUserStore()
  const { user } = storeToRefs(userHomer) // is reactive
  // const { user.isAdmin } = userHomer // is not reactive
  
  </script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div v-if="user">
      <p>User {{ user.name }} is <span v-if="!user.isAdmin">not</span> an admin</p>
      <input v-model="user.name" placeholder="edit me" />
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
