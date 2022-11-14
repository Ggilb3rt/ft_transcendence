<script setup lang="ts">
import Loader from '@/components/navigation/loader.vue';

window.addEventListener('beforeunload', () => {
  localStorage.setItem('second listener', 'true')
})

async function log() {
  try {
    const response = await fetch(`http://localhost:3000/auth`, {credentials: "include"})
    var data;
    if (response.status >= 200 && response.status < 300) {
        data = await response.json()
    }
    else {
      throw new Error(JSON.stringify({response: response, body: {statusCode: response.status, message: response.statusText }}))
    }
    if (data) {
       console.log("login ", data)
      }
  } catch (error: any) {
    console.log("error login")
  }
}


</script>

<template>
    <div class="loginWrapper">
      <h1>Let's play <br>a <span class="red">game</span></h1>
      <Loader></Loader>
      <figure>
        <img alt="Pong logo" class="logo" src="@/assets/logo.svg" />
        <a href="http://localhost:3000/auth" class="btn">Connection with 42</a>
        <button @click="log()" class="btn">Connection with 42</button>
      </figure>
    </div>
</template>

<style>
.loginWrapper {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  padding: 50px;
  background: url(@/assets/space-flame.png) no-repeat center center;
}

.loginWrapper figure {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loginWrapper .logo {
  transform: scale(1.5);
  margin-bottom: 20px;
}

.loginWrapper h1 {
  font-size: 64px;
  line-height: 57px;
  text-transform: uppercase;
  text-align: right;
  color: #fff;
}
/* 
h1 span::before {
  content: '\a';
  white-space: pre;
} */

.loginWrapper .btn {
  color: #fff;
  background: var(--global-c-blue);
  transition: all .4s ease;
  padding: 25px;
  font-size: 20px;
  font-weight: 400;
  border: none;
}
.loginWrapper .btn:hover {
  background: var(--global-c-blue-hover);
}
</style>