<script setup lang="ts">
import TheWelcome from "@/components/TheWelcome.vue";



</script>

<template>
  <main>
    <ul class="gameList">
      <li>
        <a href="/baseGame">Pong<br>
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

    <!-- <TheWelcome /> -->
  </main>
</template>

<style>
.gameList {
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.gameList li a {

}

.gameList li a img{
  width: 70%;
  max-height: 300px;
  overflow: hidden;
}
</style>
