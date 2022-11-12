<script setup lang="ts">
import io from "socket.io-client";
import router from "@/router";
import { onBeforeUnmount, ref } from "vue";

const socket = io("http://localhost:3000/game");

async function findGame(event: Event, game: string) {
  event.preventDefault();
  router.push({ path: `/game/${game}` });
}

socket.emit("getActiveRoomNames", { type: 1 });

const activeRoomNames = ref([]);
socket.on("getActiveRoomNames", (payload) => {
  activeRoomNames.value = payload.roomNames;
});

onBeforeUnmount(() => {
  socket.disconnect();
});
</script>

<template>
  <div class="vue_wrapper home">
    <h1>Let's play a <span class="red">game</span></h1>
    <nav>
      <ul class="gameList">
        <li>
          <button id="pong" @click="findGame($event, 'pong')" class="pongLink">
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
            @click="findGame($event, 'catPong')"
            class="pongLink"
          >
            CatPong<br />
            <img
              src="../assets/pongCat.png"
              alt="view of special game Cat pong"
              srcset=""
            />
          </button>
        </li>
        <li>
          <button
            id="customizable"
            @click="findGame($event, 'customizable')"
            class="pongLink"
          >
            Customizable<br />
            <img src="../assets/more.jpg" alt="another pong game" srcset="" />
          </button>
        </li>
      </ul>
    </nav>
    <h1>Let's watch a <span class="red">game</span></h1>
    <nav>
      <ul class="gameList" v-if="activeRoomNames.length > 0">
		<!-- <p v-for="room in activeRoomNames" :key="room"> -->
        <p v-for="(value) in activeRoomNames" :key="value">
          <button
                id="customizable"
                @click="findGame($event, `${value.level}/${value.id}`)"
                class="pongLink"
              >{{value.id}} {{ value.level }}
          </button>
        </p>
      </ul>
      <p v-else>No game</p>
    </nav>
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
