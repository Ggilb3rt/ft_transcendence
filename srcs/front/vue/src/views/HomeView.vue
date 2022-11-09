<script setup lang="ts">
import UserInvite from "@/components/user/UserInvite.vue";
import io from "socket.io-client";
import router from "@/router";
import { onBeforeUnmount, ref } from "vue";

let socket = io("http://localhost:3000/game");

// simule server timing
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let inQueue = ref(false);

async function findGame(event: Event, game: string) {
  event.preventDefault();
  if (inQueue.value) return;
  inQueue.value = true;
  const url = `http://localhost:3000/lobby/${game}`;
  const data = Math.floor(Math.random() * 1000 + 1); // await fetch data and get game id
  const motivational = [
    "Recherche d'opposant",
    "nettoyage des raquettes",
    "reveil du chat",
    "préparation du terrain",
  ];

  const btnEl = document.getElementById(game);
  let span = document.createElement("span");
  span.classList.add("loader");
  span.innerText = motivational[0];
  btnEl?.appendChild(span);

  //console.log(url)
  for (let i = 0; i < 4; i++) {
    //await sleep(1000)
    span.innerText = motivational[i];
  }

  //await sleep(1000)
  // console.log(data);
  btnEl?.removeChild(span);
  router.push({ path: `/game/${game}` });
}

socket.emit("getActiveRoomNames");

const activeRoomNames = ref([]);
socket.on("getActiveRoomNames", (payload) => {
  activeRoomNames.value = payload.roomNames;
  console.log('HOME VIEW ACTIVE ROOM NAMES');
  console.log(activeRoomNames);
});
//const activeGames =

//const items = ref([{ message: 'Foo' }, { message: 'Bar' }])
//const items = ref(["Foo", "Bar"]);

onBeforeUnmount(() => {
  if (socket) {
    socket.disconnect();
  }
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
      <ul class="gameList">
		<p v-for="room in activeRoomNames" :key="room">
		<button
            id="customizable"
            @click="findGame($event, `${room}`)"
            class="pongLink"
          >{{ room }}</button></p>
      </ul>
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
