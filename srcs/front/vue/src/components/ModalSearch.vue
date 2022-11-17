<script setup lang="ts">
import { ref, onMounted, onUpdated, watch } from "vue"
import { useUsersStore } from '../stores/users'
import { useUserStore } from '../stores/user'
import Modal from './Modal.vue'
import UserLink from "./user/UserLink.vue";
import CarbonSearch from "@/components/icones-bags/CarbonSearch.vue"
import CarbonClose from "@/components/icones-bags/CarbonClose.vue"


const props = defineProps({
    show: Boolean
})

const userStore = useUserStore()
const usersStore = useUsersStore()

const showSearchUserModal = ref(false)
const searchInput = ref<HTMLElement | null>(null)

let nicknameSearch = ref("")
function filteredNames() {
	return usersStore.userList.filter((user) => user.nickname.toLowerCase().includes(nicknameSearch.value.toLowerCase()) && user.id != userStore.user.id)
}


onUpdated(() => {
    if (searchInput.value)
            searchInput.value.focus()
})

watch(showSearchUserModal, (newVal) => {
    if (newVal == true) {
        if (searchInput.value)
            searchInput.value.focus()
    }
})

</script>

<template>
    <div>
        <button @click="showSearchUserModal = true">
            <i class="icon-search-button">
                <CarbonSearch></CarbonSearch>
            </i>
        </button>
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showSearchUserModal" @keyup.esc="showSearchUserModal = false">
                    <div class="search-mask" @click="showSearchUserModal = false"></div>    
                    <div class="container-search">
                        <button class="modal-default-button" @click="showSearchUserModal = false">
                            <i class="icon_btn">
                                <CarbonClose></CarbonClose>
                            </i>
                        </button>
                        <input 
                        type="search"
                        ref="searchInput"
                        id="search-bar"
                        placeholder="find a user"
                        autocomplete="off"
                        v-model="nicknameSearch"
                        />
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
    background-color: rgba(10, 10, 10, 0.9);
    transition: opacity 0.3s ease;
}

.container-search {
    position: fixed;
    top: 50px;
    left: calc(50% - 90% / 2);
    width: 90%;
    z-index: 9998;
    padding: 10px;
    color: var(--vt-c-text-light-1);
    border-radius: var(--global-border-radius);
    transition: all scale 0.3s ease;
    /* background-color: #fff; */
    /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33); */
}

.list {
    margin: 30px 0;
}
.list ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0;
    gap: 20px;
}

.list img {
    max-width: 100px;
}

.modal-default-button {
    float: right;
}

.container-search input {
    background: none;
    border: 1px solid rgba(100,100,100, .6);
    width: 100%;
    font-size: 2.5em;
    color: #fff;
}

    /*
    * The following styles are auto-applied to elements with
    * transition="modal" when their visibility is toggled
    * by Vue.js.
    *
    * You can easily play with the modal transition by editing
    * these styles.
    */

/* .modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
} */



@media screen and (min-width: 800px) {
    .container-search {
        left: calc(50% - 70% / 2);
        width: 70%;
    }

    .container-search input{
        font-size: 2em;
    }
}

@keyframes identifier {
    
}

</style>