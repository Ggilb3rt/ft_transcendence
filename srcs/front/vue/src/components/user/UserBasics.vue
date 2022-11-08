<script setup lang="ts">
import UserInvite from './UserInvite.vue';
import UserEditableNick from './UserEditableNick.vue';
import UserEditableAvatar from './UserEditableAvatar.vue'
</script>

<template>
	<div class="userBasics">
		<UserEditableAvatar></UserEditableAvatar>
		<UserEditableNick></UserEditableNick>
		<UserInvite></UserInvite>
	</div>
</template>

<style>

</style>