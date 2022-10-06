<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { useUsersStore } from '@/stores/users'
import type { IUser, IOtherUserRestrict } from '@/types'
import UserLink from './UserLink.vue'



const userStore = useUserStore()
const usersStore = useUsersStore()
// const { getUserNick } = useUserStore()
// const { getUserNick } = storeToRefs(user) // make getUserNick has a ref ==> reactive
let toggleMatch = ref(true);

function findOpponent(opponent: number): IOtherUserRestrict | null {
    return usersStore.userList.filter((leuser) => userStore.user.match_history.find(el => leuser.id === opponent))[0]
}

</script>

<template>
    <div>
        <h1
          @click="toggleMatch = !toggleMatch"
          :class="{
            triangleUp: toggleMatch && userStore.user.match_history != null,
            triangleDown: !toggleMatch && userStore.user.match_history != null}"
        >Match History</h1>
        <div class="matchHistory" :class="{hide: !toggleMatch }" v-if="userStore.user.match_history != null">
            <div v-for="match in userStore.user.match_history" :key="match.opponent">
                <div :class="{win: match.win, loose:!match.win}" class="matchResume">
                    <div class="me">
                        <img class="userAvatar" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'">
                        <p>{{userStore.getUserNick()}}</p>
                    </div>
                    <div class="score">
                        <p>
                            <span :class="{scoreLose: !match.win}">{{match.myScore}}</span> - 
                            <span :class="{scoreLose: match.win}">{{match.opponentScore}}</span>
                        </p>
                    </div>
                    <div class="opponent">
                        <UserLink :other-user="findOpponent(match.opponent)" remove-status></UserLink>
                        <!-- <img class="userAvatar" :src="userStore.user.avatar_url" :alt="userStore.user.nickname + ' avatar'">
                        <p>@dark_sasuke</p> -->
                    </div>
                </div>
            </div>
        </div>
        <div v-else>
            <p>No matchs here
                <a href="/">Make your first game</a>
            </p>
        </div>
    </div>
</template>

<style>

.matchHistory {
  color: #fff;
  height: auto;
  max-height: 200vh;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  overflow: hidden;
  transform: scaleY(1);
  transition: all .5s ease-out;
}

.matchHistory .matchResume {
  display: flex;
  padding: 10px;
  border-radius: var(--global-border-radius);
}

.matchHistory img {
  max-width: 40%;
}

.matchHistory .score {
  min-width: 50px;
}

.matchHistory .win .score p:after {
  left: 0;
}

.matchHistory .loose .score p:after {
  right: 0;
}

.matchHistory .me, .matchHistory .opponent {
  overflow-wrap: break-word;
}

.matchHistory .opponent {
  text-align: right;
}

.matchHistory img {
  width: 100px;
}

.matchHistory .win .opponent, .matchHistory .loose .me, .matchHistory .scoreLose { opacity: .5; }

.matchHistory .win {
  background: var(--global-c-blue-hover);
}

.matchHistory .loose {
  background: var(--global-c-red-hover);
}


@media (min-width: 322px) {
  .matchHistory .score {
    font-size: 2em;
  }

  .matchHistory .score p:after {
    content: '';
    display: block;
    position: absolute;
    width: 50%;
    height: 6px;
    background: #fff;
  }
}
</style>