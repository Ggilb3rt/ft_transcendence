<script setup lang="ts">
import router from "@/router";
import { onBeforeUnmount, ref } from "vue";
import { useUserStore } from "@/stores/user";
import Modal from "@/components/Modal.vue";
import { useStatusStore } from "@/stores/status";
import WatchGameListVue from "@/components/WatchGameList.vue";

const userStore = useUserStore();
const userId = userStore.user.id;
const statusStore = useStatusStore();
const socket = statusStore.socketGame;

const canPlay = ref(true);
const show = ref(false);
socket.emit("isUserInGame", { userId });
socket.on("isUserInGame", (data) => {
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


onBeforeUnmount(() => {
  socket.off();
});
</script>

<template>
  <div class="vue_wrapper home">
    <h1>Let's play a <span class="red">game</span></h1>
    <nav>
      <ul class="gameList">
        <li>
          <button
            id="pong"
            @click="findGame($event, 'pong', '', false)"
            class="pongLink"
          >
            Pong<br />
            <img
              src="../assets/pongGame.png"
              alt="view of standard game pong"
              srcset=""
            />
          </button>
        </li>
        <li>
          <button
            id="catPong"
            @click="findGame($event, 'catPong', '', false)"
            class="pongLink"
          >
            FoxPong<br />
            <img id="fox_pong_img"
              src="../assets/foxPong.png"
              alt="view of special game Fox pong"
              srcset=""
            />
          </button>
        </li>
        <li>
          <button
            id="customizable"
            @click="findGame($event, 'customizable', '', false)"
            class="pongLink"
          >
            Customizable<br />
            <img src="../assets/more.jpg" alt="another pong game" srcset="" />
          </button>
        </li>
      </ul>
    </nav>
    <h1>Let's watch a <span class="red">game</span></h1>
    <WatchGameListVue></WatchGameListVue>
    <Modal v-if="!canPlay" :show="show" removeOK>
      <template #header>
        <h2>YOU ALREADY ARE IN A GAME OR WAITING ROOM</h2>
      </template>
      <template #body>
        <button @click="show = false">OK</button>
      </template>
    </Modal>
  </div>
</template>

<style>
.gameList .loader {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: red;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gameList {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.gameList li button {
  background: var(--color-background);
  border: none;
  color: #fff;
  text-align: left;
}
.gameList li button:hover,
.gameList li button:active {
  background: none;
}
.gameList li button:hover img,
.gameList li button:active img {
  transition: border 0.1s ease-in;
  border: 1px solid rgb(21, 216, 255);
}

.gameList li button img {
  width: 100%;
  max-height: 400px;
  margin-top: 5px;
}

@media screen and (min-width: 768px) {
  .gameList {
    flex-direction: row;
    gap: 10px;
    justify-content: left;
  }
  .gameList li {
    width: calc(100% / 3);
  }
  .gameList li a img {
    max-height: 200px;
  }
}
</style>
