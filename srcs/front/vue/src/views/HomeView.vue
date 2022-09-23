<script setup lang="ts">
import TheWelcome from "@/components/TheWelcome.vue";
import UserHero from "@/components/UserHero.vue";
import router from "@/router";

// we be usefull with Oauth2
const isLog: boolean = false
if (!isLog)
  router.push('login')

// simule server timing
function sleep(ms: number) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

async function findGame(game: string) {
  const url = `http://localhost:3000/lobby/${game}`
  const data = Math.floor(Math.random() * 1000 + 1) // await fetch data and get game id
  const motivational = ["Recherche d'opposant", "nettoyage des raquettes", "reveil du chat", "préparation du terrain"]

  const btnEl = document.getElementById(game)
  let span = document.createElement("span")
  span.classList.add('loader')
  span.innerText = motivational[0]
  btnEl?.appendChild(span)


  console.log(url)
  for(let i = 0; i < 4; i++) {
    await sleep(1000)
    span.innerText = motivational[i]
  }

  await sleep(1000)
  console.log(data);
  btnEl?.removeChild(span)
  router.push({ path: `/game/${game}/${data}`, })
}
</script>

<template>
  <div class="vue_wrapper home">
    <h1>Let's play a <span class="red">game</span></h1>
    <nav>
      <ul class="gameList">
        <li>
          <button id="pong" @click="findGame('pong')" class="pongLink">Pong<br>
            <img src="../assets/pongGame.png" alt="view of standard game pong" srcset="">
          </button>
        </li>
        <li>
          <button id="catPong" @click="findGame('catPong')" class="pongLink">Pong<br>
            <img src="../assets/pongCat.png" alt="view of special game Cat pong" srcset="">
          </button>
        </li>
        <li>
          <a href="/lobby?=tong">Tong<br>
            <img src="../assets/more.jpeg" alt="another pong game" srcset="">
          </a>
        </li>
      </ul>
    </nav>


    <!-- <h1>Infos</h1>
    <UserHero /> -->

    <!-- <TheWelcome /> -->
  </div>
</template>

<style>

.gameList .loader {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: red;
    z-index: 10;
}

.gameList {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0;
}

.gameList li a {
  display: block;
}
.gameList li a:hover, .gameList li a:active {
  background: none;
}
.gameList li a:hover img, .gameList li a:active img {
  transition: border .1s ease-in;
  border: 1px solid rgb(21, 216, 255);
}

.gameList li a img{
  width: 100%;
  max-height: 400px;
}

@media screen and screen and (min-width: 768px) {
  .gameList {
    flex-direction: row;
    gap: 10px;
    justify-content: left;
  }
  .gameList li a img{
    max-height: 200px;
  }
}
</style>
