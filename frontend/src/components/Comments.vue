<script setup>
const newComment = defineModel()

const props = defineProps({
    comments: {
        type: Array,
    },
    presenter: String,
    title: String
})

//POST FETCH REQUEST
function addComment() {
    fetch('/talks/comments', {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      message: newComment.value,
      author: props.presenter,
      title: props.title
    })
  })
  newComment.value = ""
}

</script>
<template>
      <div v-for="(comment, index) in props.comments" :key="index">
        <div v-if="comment.message">
          <strong> {{ comment.presenter }}</strong> : {{ comment.message }}
        </div>
      </div>

<div>
    <form @submit.prevent="addComment">
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
  padding: 5px
}
</style>