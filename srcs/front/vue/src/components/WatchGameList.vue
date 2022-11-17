<!-- eslint-disable prettier/prettier -->
<script setup lang="ts">
import { ref } from "vue";
import router from "@/router";
import { useUsersStore } from "@/stores/users";
import { useStatusStore } from "@/stores/status";
import { useUserStore } from "@/stores/user";

const props = defineProps<{
    friends?: boolean
}>()


const userStore = useUserStore();
const userId = userStore.user.id;
const usersStore = useUsersStore();
const statusStore = useStatusStore();
const socket = statusStore.socketGame;

async function findGameWatch(
  event: Event,
  level: string,
  roomId: string,
) {
  event.preventDefault();
  socket.off();
  router.push({ path: `/game/2/${level}/${roomId}` });
}

socket.emit("getActiveRoomNames", { userId });

const activeRoomNames = ref([]);
socket.on("getActiveRoomNames", (payload: any) => {
  activeRoomNames.value = payload.roomNames;
});
</script>

<template>
  <nav>
    <ul class="gameList" v-if="Object.keys(activeRoomNames).length > 0">
      <p v-for="value in activeRoomNames" :key="value">
        <button
          id="customizable"
          @click="findGameWatch($event, `${value.level}`, `${value.id}`)"
          class="pongLink"
          v-if="friends == false"
        >
          {{ value.level }} {{ usersStore.getUserNickById(value.p1) }} vs
          {{ usersStore.getUserNickById(value.p2) }}
        </button>
        <button
          id="customizable"
          @click="findGameWatch($event, `${value.level}`, `${value.id}`)"
          class="pongLink"
          v-else-if="value.p1 === usersStore.user.id || value.p2 === usersStore.user.id"
        >
          {{ value.level }} {{ usersStore.getUserNickById(value.p1) }} vs
          {{ usersStore.getUserNickById(value.p2) }}
        </button>
      </p>
    </ul>
    <p v-else>No game</p>
  </nav>
</template>
