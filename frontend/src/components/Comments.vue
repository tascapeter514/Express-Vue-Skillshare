<script setup>
import {ref} from "vue"
// function addNewComment(talkId) {
//   const currentTalk = talks.value.find(talk => talk.id === talkId)
//   const commentData = {
//    
//     presenter: currentUser,
//     message: currentTalk.newComment
//   }

//   if (currentTalk) {
//     currentTalk.comments.push(commentData);
//   }

//   currentTalk.newComment = "";
// }
const newComment = defineModel()

const props = defineProps({
    comments: {
        type: Array,
        required: true
    },
    presenter: String,
    title: String
})
// const emit = defineEmits(['addNewComment'])

function handleNewComment() {
    // console.log(newComment.value)
    // console.log("presenter:", props.presenter)
    // console.log("title:", props.title)
    fetch('http://localhost:3000/talks/comments', {
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