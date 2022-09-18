<script setup lang="ts">
import TheWelcome from "@/components/TheWelcome.vue";
import router from "@/router";

// we be usefull with Oauth2
const isLog: boolean = false
if (!isLog)
  router.push('login')

</script>

<template>
  <div class="vue_wrapper home">
    <h1>Let's play a <span class="red">game</span></h1>
    <nav>
      <ul class="gameList">
        <li>
          <a href="/baseGame" class="pongLink">Pong<br>
            <img src="../assets/pongGame.png" alt="view of standard game pong" srcset="">
          </a>
        </li>
        <li>
          <a href="/catGame">CatPong<br>
            <img src="../assets/pongCat.png" alt="view of special game Cat pong" srcset="">
          </a>
        </li>
        <li>
          <a href="/tongGame">Tong<br>
            <img src="../assets/more.jpeg" alt="another pong game" srcset="">
          </a>
        </li>
      </ul>
    </nav>
      
    <!-- <TheWelcome /> -->
  </div>
</template>

<style>
.gameList {
  list-style: none;
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
