<script lang="ts">
import { storeToRefs } from 'pinia';
import { useCounterStore } from '@/stores/counter';
import { useUserStore } from '@/stores/users';

export default {
  setup() {
    const counter = useCounterStore()
    const users = useUserStore()
    const { getUserTag } = storeToRefs(users) // make getUserTag has a ref ==> reactive

    counter.count++
    counter.$patch({ count: counter.count + 1})
    counter.increment()

    // ici je return tout le store mais c'est une mauvaise pratique car pas secure
    // il vaut mieux faire comme avec 'getUserTag' et return uniquement le necessaire
    return {
      counter,
      users,
      getUserTag,
    }
  },
  props: ["userProp"],
  data() {
    return {};
  },
  // must be in user interface or somewhere else
  computed: {
  },
};
</script>

<template>
  <div v-for="user in users.userList" class="heroCard">
    <br>
    <img class="heroAvatar" :src="user.img" :alt="user.name + ' avatar'" />
    <p class="heroName">{{ user.name }}</p>
    <p class="heroTag">
      <a href="#" v-if="userProp == user.id">{{ user.tag }}</a>
      <a href="#" v-else>{{ getUserTag }}</a>
    </p>
    <p>Win rate <b>{{ users.getUserWinRate(user) }}</b></p>
  </div>
  <!-- <div class="heroCard">
    <img class="heroAvatar" :src="user.img" :alt="user.name + ' avatar'" />
    <p class="heroName">{{ user.name }}</p>
    <p class="heroTag">
      <a href="#">{{ tagName }}</a>
      {{counter.count + counter.name + " " + counter.doubleCount}}
    </p>
  </div>
  <div class="heroCard">
    <img class="heroAvatar" :src="users.user.img" :alt="users.user.name + ' avatar'" />
    <p class="heroName">{{ users.user.name }}</p>
    <p class="heroTag">
      <a href="#">{{ getUserTag }}</a>
    </p>
  </div> -->
</template>

<style scoped>
.heroCard p {
  font-family: "Inder", sans-serif;
  font-style: normal;
  font-weight: 400;
}

.heroCard .heroAvatar {
  max-width: 40%;
  border-radius: 10px;
}

.heroCard .heroName {
  font-size: 24px;
  line-height: 30px;
}

.heroCard .heroTag {
  font-size: 15px;
  line-height: 19px;
}
</style>
