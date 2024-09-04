<script setup>

import { ref } from 'vue';

const props = defineProps({
    talks: Array,
    talkFormVisible: Boolean,
    currentUser: String,
})



//talk form input variables
const talkTitle = ref('');
const talkSummary = ref('');


//PUT FETCH REQUEST
const postTalk = () => {
    const checkForRepeatTitle = props.talks.some((talk) => talk.title == talkTitle.value)
    if (checkForRepeatTitle) {
        alert("There is already a talk with this title. Please enter another title for your talk.")
    } else {
        fetch('/talks/addTalk', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: talkTitle.value,
                summary: talkSummary.value,
                presenter: props.currentUser,
                timeStamp: new Date(),
                comments: [],
            })
        })
    }
talkTitle.value = "";
talkSummary.value = "";
}


</script>

<template>
    <div class="talkSubmitForm" v-show="talkFormVisible">
        <form @submit.prevent="postTalk">
            <h3>Submit a Talk</h3>
            <label for="title">Title: </label>
            <input v-model="talkTitle">
            <label for="summary">Summary: </label>
            <input v-model="talkSummary">
            <button type="submit">Submit</button>
        </form>
    </div>
</template>

<style scoped>

.talkSubmitForm {
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
button {
  background-color: orange;
  margin-top: 10px;
  border-radius: 30px;
  font-weight: bold;
  color: black;
  border: black;
  padding: 5px
}

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px
}


</style>
