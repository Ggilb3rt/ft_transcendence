<script setup lang="ts">
import { useStatusStore } from '@/stores/status'
import { useUserStore} from '@/stores/user'
import MdiCrown from "@/components/icones-bags/MdiCrown.vue"
import ArcticonsPong from "@/components/icones-bags/ArcticonsPong.vue"
import MdiSwordCross from "@/components/icones-bags/MdiSwordCross.vue"
// import MdiSword from "@/components/icones-bags/MdiSword.vue"
// import LucideSword from "@/components/icones-bags/LucideSwords.vue"

const userStore = useUserStore()
const statusStore = useStatusStore()


function refuseChallenge() {
	if (userStore.user) {
		// si je dois emit
		statusStore.refuseChallenge(userStore.user.id)
		// si juste changement local
		// statusStore.changeCurrentUserStatus("available",userStore.user.id)
	}
}
</script>

<template>
	<div v-if="statusStore.status == 'challenged'" class="challenger-timer">
		<button @click="refuseChallenge()" title="Cancel Challenge">
			<i>
				<!-- <MdiCrown></MdiCrown> -->
				<MdiSwordCross></MdiSwordCross>
				<!-- <MdiSword></MdiSword> -->
				<!-- <LucideSword></LucideSword> -->
				<!-- <ArcticonsPong></ArcticonsPong> -->
			</i>
			<!-- Cancel challenge -->
		</button>
	</div>
</template>

<style>
.challenger-timer {
	/* position: fixed; */
	/* top: 50%; */
	/* left: 50%; */
	/* color: red; */
	/* width: 0px; */
	/* animation: timer 4s infinite ease-out; */
	/* z-index: 1000; */
}

.challenger-timer:hover button {
	color: red;
}

.challenger-timer button {
	background: none;
	color: black;
	font-size: 1.2em;
	animation: challenge_timer 4s infinite reverse ease-out;
	border: none;
}




@keyframes challenge_timer {
	0% {
		color: var(--global-c-blue);
	}
	50% {
		color: var(--color-background);
	}
	100% {
		color: var(--global-c-blue);
	}
}

</style>