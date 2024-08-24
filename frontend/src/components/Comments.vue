<script setup>
import {ref} from "vue"

const newComment = defineModel()

const props = defineProps({
    comments: {
        type: Array,

    },
    presenter: String,
    title: String
})


function handleNewComment() {
    fetch('/talks/database/comments', {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      message: newComment.value,
      presenter: props.presenter,
      title: props.title
    })
  })
  newComment.value = ""
}




</script>
<template>


<div>
      <div v-for="comment in props.comments" :key="comment.message">
        <strong> {{ comment.author }}</strong> : {{ comment.post }}
      </div>
      </div>
<div>
    <form @submit.prevent="handleNewComment">
    <input v-model="newComment">
    <button>Add comment</button>
    </form>
</div>     
    
    



</template>
<style scoped>

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px
}

button {
  background-color: orange;
  margin-top: 10px;
  border-radius: 30px;
  font-weight: bold;
  color: black;
  border: black;
}





</style>