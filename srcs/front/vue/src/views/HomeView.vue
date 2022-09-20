<script setup lang="ts">
import TheWelcome from "@/components/TheWelcome.vue";
import UserHero from "@/components/UserHero.vue";
import router from "@/router";

// we be usefull with Oauth2
const isLog: boolean = true
if (!isLog)
  router.push('login')

function goToLobby(game: string) {
  const url = "http://localhost:3000/lobby/pong"
  const data = null // await fetch data

  const btnEl = document.getElementById('pong')
  let span = document.createElement("span")
  span.classList.add('loader')
  span.innerText = "Recherche d'opposant ; nettoyage des raquettes ; reveil du chat ; préparation du terrain ;"
  btnEl.appendChild(span)


  console.log(url)
  setTimeout(() => { console.log(data); btnEl.removeChild(span)}, 3000)
}

</script>

<template>
  <div class="vue_wrapper home">
    <h1>Let's play a <span class="red">game</span></h1>
    <nav>
      <ul class="gameList">
        <li>
          <button id="pong" @click="goToLobby('pong')" class="pongLink">Pong<br>
            <img src="../assets/pongGame.png" alt="view of standard game pong" srcset="">
          </button>
        </li>
        <li>
          <a href="/lobby?=catPong">CatPong<br>
            <img src="../assets/pongCat.png" alt="view of special game Cat pong" srcset="">
          </a>
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

@media screen and (min-width: 768px) {
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
