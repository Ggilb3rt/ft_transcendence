<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useUsersStore } from '@/stores/users';
import { useChannelsStore } from '@/stores/channels';

const userStore = useUserStore()
const usersStore = useUsersStore()
const channelsStore = useChannelsStore()

</script>

<template>
	<div class="loader" v-if="userStore.loading || usersStore.loading || channelsStore.loading">
		<div>
			<span class="bar ping"></span>
			<span class="bar ball"></span>
			<span class="bar pong"></span>
		</div>
	</div>
</template>

<style scoped>

.loader {
	position: relative;
	left: calc(50% - 25px);
	top: 5px;
	width: 50px;
	height: 50px;
	padding: 10px;
	background: none;
	/* border: 3px solid #fff; */
	color: #fff;
	/* align-self: flex-end; */
	/* transition: all .2s ease-in-out; */
	align-self: flex-start;
}
.bar {
	display: block;
	width: 60%;
	height: 3px;
	background: #fff;
	margin: 5px;
}
.bar:first-child {
	margin: 3px 5px 5px;
}

.ping {
	animation: ping 2s infinite alternate ease-out;
}

.pong {
	animation: pong 2s infinite alternate ease-in-out;
}

.ball {
	animation: ball 2s infinite alternate ease-in;
}



@keyframes ping {
  0% {}
  25% {
    transform: rotate(90deg) translateY(15px);
  }
  50% {
    transform: rotate(90deg) translateY(15px) translateX(-5px);
  }
  75% {
    transform: rotate(90deg) translateY(15px) translateX(0px);
  }
	100% {
		transform: rotate(90deg) translateY(15px) translateX(7px);
	}
}

@keyframes pong {
  0% {}
  25% {
    transform: rotate(-90deg) translateY(15px);
  }
  50% {
    transform: rotate(-90deg) translateY(15px) translateX(10px);
  }
  75% {
    transform: rotate(-90deg) translateY(15px) translateX(0px);
  }
	100% {
		transform: rotate(-90deg) translateY(15px) translateX(20px);
	}
}

@keyframes ball {
  0% {
		width: 60%;
  }
  25% {
    width: 20%;
  }
  50% {
		width: 20%;
    transform: translateX(16px) translateY(-5px);
	}
  100% {
		width: 20%;
    transform: translateX(-7px);
	}
}





</style>