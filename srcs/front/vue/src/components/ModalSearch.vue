<script setup lang="ts">
import { ref, onMounted } from "vue"
import Modal from './Modal.vue'
import IconCommunity from "./icons/IconCommunity.vue";


const props = defineProps({
    show: Boolean
})

const showSearchUserModal = ref(false)
const searchInput = ref(null)


function openModal() {
    showSearchUserModal.value = true
    // console.log(searchInput.value)
    // if (searchInput.value)
    //     searchInput.value.focus()

}


</script>

<template>
    <i @click="openModal()"><IconCommunity /></i>
    <Teleport to="body">
        <!-- use the modal component, pass in the prop -->
        <Modal :show="showSearchUserModal" @close="showSearchUserModal = false">
        <template #header>
            <h3>Find user</h3>
        </template>
        <template #body>
            <input type="search" id="search-bar" autofocus>
            <p>list of users</p>
        </template>
        <template #footer>

        </template>
        </Modal>
    </Teleport>
</template>

<style>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
    transition: opacity 0.3s ease;
}

.modal-wrapper {
    display: table-cell;
    vertical-align: middle;
}

.modal-container {
    width: 300px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
}

/* .modal-header h3 {
    margin-top: 0;
    color: #42b983;
} */

.modal-body {
    margin: 20px 0;
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
</style>