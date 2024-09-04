<script setup>

import { ref } from 'vue'

const props = defineProps({
    currentUser: String,
    currentUserVisible: Boolean,


})

const emits = defineEmits(['setUserName'])


let currentUser = ref(localStorage.getItem('user') || "Anon");
const userField = ref('')

function setUserName(event) {
    console.log("set user name input value:", userField.value)
    currentUser.value = userField.value

    if (event.key == "Enter") {
        localStorage.setItem("user", currentUser.value)
    }
    emits('setUserName', currentUser.value)
    userField.value = "";
    
}



</script>

<template>
    <div class="currentUserForm" v-show="currentUserVisible">
        <h2>The current user is {{ currentUser }} </h2>
        <div class="inputField">
            <label for="userField">Your name: </label>
            <input id="userField" v-model="userField" @keydown.enter="setUserName">
        </div>
    </div>


</template>

<style scoped>

.currentUserForm {
    border: orange solid;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 100%;
    height: 100%;
    box-shadow: 15px 15px 15px black;
    position: relative;
}

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px
}

</style>