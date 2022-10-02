<script setup lang="ts">
import { useUsersStore } from '@/stores/users';

const usersStore = useUsersStore()

</script>

<template>
    <div class="userBasics">
        <figure class="heroFigure">
            <img class="heroAvatar" :src="usersStore.user.avatar_url" :alt="usersStore.user.nickname + ' avatar'">
        </figure>
        <div>
            <p class="heroName">{{ usersStore.user.first_name }} {{ usersStore.user.last_name}}</p>
            <p class="heroTag">
                <div>
                    <a href="#">{{ usersStore.user.nickname }}</a>
                </div>
            </p>
        </div>
    </div>
</template>

<style>

</style>