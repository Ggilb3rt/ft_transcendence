<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useUsersStore } from '../stores/users'
import { useUserStore } from '../stores/user'
import Modal from './Modal.vue'
import IconCommunity from "./icons/IconCommunity.vue";
import UserLink from "./UserLink.vue";


const props = defineProps({
    show: Boolean
})

const userStore = useUserStore()
const usersStore = useUsersStore()

// il serait sympa de mettre un focus sur le premier user de la liste
// ==> ajout d'un @keypress.enter="..." sur le input
// userFriendly++

const showSearchUserModal = ref(false)
const searchInput = ref(null)

let nicknameSearch = ref("")
function filteredNames() {
	return usersStore.userList.filter((user) => user.nickname.toLowerCase().includes(nicknameSearch.value.toLowerCase()) && user.id != userStore.user.id)
}

</script>

<template>
    <div>
        <button @click="showSearchUserModal = true">
            <i class="icon-search-button">
                <IconCommunity />
            </i>
        </button>
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showSearchUserModal" @keyup.esc="showSearchUserModal = false">
                    <div class="search-mask" @click="showSearchUserModal = false"></div>    
                    <div class="container-search">
                        <input 
                        type="search"
                        id="search-bar"
                        autofocus
                        placeholder="find a user"
                        autocomplete="off"
                        v-model="nicknameSearch"
                        />
                        <button class="modal-default-button" @click="showSearchUserModal = false">X</button>
                        <div class="list">
                            <ul>
                                <li v-for="user in filteredNames()" :key="user.id" @click="showSearchUserModal = false">
                                    <UserLink :other-user="user"></UserLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style>

.search-mask {
    position: fixed;
    z-index: 9990;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    transition: opacity 0.3s ease;
}

.container-search {
    position: fixed;
    top: 50px;
    left: calc(50% - 90% / 2);
    width: 90%;
    z-index: 9998;
    padding: 10px;
    background-color: #fff;
    color: var(--vt-c-text-light-1);
    border-radius: var(--global-border-radius);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all scale 0.3s ease;
}

.list {
    margin: 10px 0;
}
.list ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    padding: 0;
    gap: 20px;
}

.list img {
    max-width: 100px;
}

.modal-default-button {
    float: right;
}

/*
    * The following styles are auto-applied to elements with
    * transition="modal" when their visibility is toggled
    * by Vue.js.
    *
    * You can easily play with the modal transition by editing
    * these styles.
    */

.modal-enter-from {
    opacity: 0;
}

.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}



@media screen and (min-width: 800px) {
    .container-search {
        left: calc(50% - 70% / 2);
        width: 70%;
    }

    .container-search input{
        font-size: 2em;
    }
}


</style>