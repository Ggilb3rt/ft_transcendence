<!-- <script setup lang="ts">
import Game from "@/components/Game.vue";


</script>

<template>
  <div class="dashboard">
    <h1>Classic Pong</h1>
    <Game msg="Bonjour le jeu" />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inder&display=swap");

@media (min-width: 1024px) {
  .dashboard {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style> -->


<script setup lang="ts">
	import { io } from "socket.io-client";
	import { onBeforeMount, ref } from "vue";
	
	const socket = io("http://localhost:3000");
	
	const messages = ref([]);
	const messageText = ref("");
	const joined = ref(false);
	const name = ref("");
	const typingDisplay = ref("");
	
	onBeforeMount(() => {
	  socket.emit("findAllGame", {}, (response: never[]) => {
		messages.value = response;
	  });
	
	  socket.on("game", (message) => {
		messages.value.push(message);
	  });
	
	  socket.on("typing", ({name, isTyping}) => {
		if (isTyping) {
			typingDisplay.value = `${name} is typing...`;
		} else {
			typingDisplay.value = '';
		}
	  })
	});
	
	const join = () => {
	  socket.emit("join", { name: name.value }, () => {
		joined.value = true;
	  });
	};
	
	const sendMessage = () => {
	  socket.emit("createGame", { text: messageText.value }, () => {
		messageText.value = "";
	  });
	};
	
	let timeout;
	const emitTyping = () => {
	  socket.emit("typing", { isTyping: true });
	  timeout = setTimeout(() => {
		socket.emit("typing", { isTyping: false });
	  }, 2000);
	};
	</script>
	
	<template>
	  <div class="chat">
		<div v-if="!joined">
		  <form @submit.prevent="join">
			<label>What's your name ?</label>
			<input v-model="name" />
			<button type="submit">Send</button>
		  </form>
		</div>
		<div class="chat-container">
		  <div class="messages-container">
			<div v-for="message in messages">
			  [{{ message.name }}]: {{ message.text }}
			</div>
		  </div>
	
		  <div v-if="typingDisplay">{{ typingDisplay }}</div>
		  <hr />
	
		  <div class="message-imput">
			<form @submit.prevent="sendMessage">
			  <label>Message:</label>
			  <input v-model="messageText" @input="emitTyping" />
			  <button type="submit">Send</button>
			</form>
		  </div>
		</div>
	  </div>
	</template>
	
	<style scoped>
	h1 {
	  font-weight: 500;
	  font-size: 2.6rem;
	  top: -10px;
	}
	
	h3 {
	  font-size: 1.2rem;
	}
	
	@media (min-width: 1024px) {
	}
	</style>
	
