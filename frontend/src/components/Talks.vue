<script setup>
import {ref, defineAsyncComponent} from 'vue'
import Comments from '/src/components/Comments.vue'

const talkTitle = ref("");
const talkSummary = ref("");

const props = defineProps({
    talks: Array,
    user: String,
    users: Array

})

const AsyncComments = defineAsyncComponent(() =>
import('/src/components/Comments.vue')
)

//`/talks/${talkTitle}`


//rewrite the delete talks function so the path is right. Ask John about /talks/${talkTitle} construction

const deleteTalk = (talkTitle) => {
  const encodedTitle = encodeURIComponent(talkTitle)
  // console.log("JSON title:", talkTitle)
  // console.log("encoded title:", encodedTitle)
  fetch(`/talks/database/${encodedTitle}`, {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}

const postTalk = () => {
  console.log("input success:", talkTitle.value, talkSummary.value);
  fetch('/talks/database/addTalk', {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: talkTitle.value,
      summary: talkSummary.value,
      presenter: props.user,
      comments: [],
    }) 
  });
  const repeatName = props.users.find((user) => user == props.user);
  if (!repeatName) {
    props.users.push(props.user);
  }
  talkTitle.value = "";
  talkSummary.value = "";
}

</script>

<template>
     <!-- <Suspense> -->
  <div 
  class="talkComponentContainer"
  >
  
    <div v-for="talk in talks" :key="talk.title">
      
      <TransitionGroup name="talkList" tag="p">
      
      <p v-if="talks && talks.length"
       class="talks">
       
        <h2 > {{ talk.title }}
          <button @click="deleteTalk(talk.title)">Remove</button>
        </h2>
        <div>
          by <strong>{{ talk.presenter }}</strong>
          <p> {{ talk.summary }}</p>
        </div>
   


        <!-- <Comments                                                                                                  
        :comments="talk.comments"
        :presenter="props.user"
        :title="talk.title"
        ></Comments> -->
        <AsyncComments :comments="talk.comments" :presenter="props.user" :title="talk.title"></AsyncComments>
      </p>

    
    </TransitionGroup>
  
  </div>
  </div>
<!-- </Suspense> -->



  <div id="submitForm">
    <form @submit.prevent="postTalk">
      <h3>Submit a Talk</h3>
      <div>
        <label for="title">Title: </label>
        <input v-model="talkTitle">
      </div>
      <div>
        <label for="summary">Summary: </label>
        <input v-model="talkSummary">
      </div>
      <button type="submit">Submit</button>
    </form>
  </div>



</template>
<style scoped>

.talkComponentContainer {
  display: flex;
  border: orange solid;
  width: 1000px;
  height: 500px;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  box-shadow: 5px 5px 5px black;
  position: absolute;
  top: 500px;
  flex-wrap: wrap;
  overflow: auto;
  scrollbar-width: none;
  transition: center 2s ease-in;
}
.talks {
  border: orange solid;
  box-shadow: 15px 15px 15px black;
  margin: 15px;
  padding: 30px;
  border-radius: 50px;
}

.talkList-move,
.talkList-enter-active,
.talkList-leave-active {
  transition: all 0.5s ease;
}
.talkList-enter-from,
.talkList-leave-to {
  opacity: 0;
  transform: translateX(30px);
}


.headerFade-leave-to,
.headerFade-enter-from {
  opacity: 0;
}
.headerFade-leave-from,
.headerFade-enter-to {
  opacity: 1;
}
.headerFade-leave-active,
.headerFade-enter-active {
  transition: opacity 0.5s;
}

#submitForm {
  border: orange solid;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-content: center;
  padding: 10px;
  top: 150px;
  position: relative;
  width: 500px;
  left: 1100px;
  box-shadow: 15px 15px 15px black;

}

button {
  background-color: orange;
  margin-top: 10px;
  border-radius: 30px;
  font-weight: bold;
  color: black;
  border: black;
}

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px
}



</style>