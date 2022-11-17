<script setup lang="ts">
import { ref } from "vue"
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { useUsersStore } from "@/stores/users";
import { useStatusStore } from "@/stores/status";

const userStore = useUserStore();
const usersStore = useUsersStore();
const userId = userStore.user.id;
const statusStore = useStatusStore();
const socket = statusStore.socketGame;
const canPlay = ref(true);
const show = ref(false);


socket.emit("isUserInGame", { userId });
socket.on("isUserInGame", (data: any) => {
    console.log("IS USER IN GAME " + data.bool);
  if (data.userId === userId) {
    canPlay.value = !data.bool;
  }
});

async function findGame(
  event: Event,
  level: string,
  roomId: string,
  spectator: boolean
) {
  event.preventDefault();
  show.value = false;
  if (spectator) {
    socket.off();
    router.push({ path: `/game/2/${level}/${roomId}` });
  } else if (canPlay.value && !spectator) {
    socket.off();
    router.push({ path: `/game/1/${level}` });
  } else {
    show.value = true;
  }
}

socket.emit("getActiveRoomNames", { type: 1 });

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
            @click="findGame($event, `${value.level}`, `${value.id}`, true)"
            class="pongLink"
          >
            {{ value.level }} {{ usersStore.getUserNickById(value.p1) }} vs {{ usersStore.getUserNickById(value.p2) }}
          </button>
        </p>
      </ul>
      <p v-else>No game</p>
    </nav>
</template>