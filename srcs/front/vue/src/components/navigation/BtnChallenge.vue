<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useUsersStore } from "@/stores/users";
import { useStatusStore } from "../../stores/status";
import Modal from "@/components/Modal.vue";

const props = defineProps({
  userId: { type: Number, required: true },
});

const showModal = ref(false);
const gameType = ref(0);
const userStore = useUserStore();
const usersStore = useUsersStore();
const statusStore = useStatusStore();

function userIsAvailable() {
	if (statusStore.status === "available") {
		console.log('usER STATUS ' + statusStore.status)
		return true;
	}
	console.log('usER STATUS ' + statusStore.status)
	return false;
}

async function selecteGameType() {
  await challenge();
  showModal.value = false;
  //("le choix est : ", gameType.value)
}

async function challenge() {
  if (usersStore.user)
    statusStore.challengeUser(userStore.user.id, gameType.value, props.userId);

  if (usersStore.user && statusStore.socketIsAvailable(props.userId)) {
    //console.log(`challenge from ${userStore.user.id} to ${props.userId}`)
    // put invitation in a modal in the other side
  }
}
</script>

<template>
  <div v-if="usersStore.getUserRestrictById(userId)">
    <div v-if="userStore.user.id != userId">
      <button
        @click="showModal = true"
        v-if="!userStore.isBan(userId) && statusStore.socketIsAvailable(userId) && userIsAvailable()"
      >
        Challenge
      </button>
    </div>
    <!-- <button @click="challenge()" v-else>Pouet</button> -->
    <Modal :show="showModal" @close="showModal = false" removeOK>
      <template #header>
        <h2>Challenge {{ usersStore.getUserNickById(userId) }}</h2>
        <h3>Select your game</h3>
      </template>
      <template #body>
        <select v-model="gameType" id="gameTypeSelector">
          <option value="0">Pong</option>
          <option value="1">FancyPong</option>
          <option value="2">Fong</option>
        </select>
        <button @click="selecteGameType()">Go !</button>
        <button @click="showModal = false">Cancel</button>
        {{ gameType }}
      </template>
    </Modal>
  </div>
</template>

<style scoped>
h2 {
  color: var(--vt-c-black-mute);
}
</style>
