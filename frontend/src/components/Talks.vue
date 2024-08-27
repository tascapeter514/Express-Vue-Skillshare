<script setup>
import {ref, defineAsyncComponent} from 'vue'


const talkTitle = ref("");
const talkSummary = ref("");
const currentIndex = ref(0); // Track the current index

const props = defineProps({
    talks: Array,
    user: String,
    users: Array

})

const AsyncComments = defineAsyncComponent(() =>
import('/src/components/Comments.vue')
)


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


const nextTalk = () => {
  if (currentIndex.value < props.talks.length - 1) {
    currentIndex.value += 1;
  } else {
    currentIndex.value = 0; // Loop back to the first talk
  }
};

const prevTalk = () => {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  } else {
    currentIndex.value = props.talks.length - 1; // Loop back to the last talk
  }
};


</script>

<template>
  

  <div 
  class="talkComponentContainer"
  >
  <i class="fas fa-arrow-circle-left" id="left_arrow_button" @click="prevTalk"></i>
  <i class="fas fa-arrow-circle-right" id="right_arrow_button" @click="nextTalk"></i>
  
    <div v-for="(talk, index) in talks" 
    :key="index"
    :style="{ zIndex: currentIndex === index ? 10 : 1, transform: currentIndex === index ? 'scale(1.1)' : 'scale(1)' }">
      
      <TransitionGroup name="talkList" tag="p">
      
      <p v-if="talks && talks.length"
       class="talks">
       
        <h2 > {{ talk.title }} {{ index }}
          <button @click="deleteTalk(talk.title)">Remove</button>
        </h2>
        <div>
          by <strong>{{ talk.presenter }}</strong>
          <p> {{ talk.summary }}</p>
        </div>
        <AsyncComments :comments="talk.comments" :presenter="props.user" :title="talk.title"></AsyncComments>
      </p>
    </TransitionGroup>
  
  </div>
 
  </div>




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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 15px));
  border: orange solid;
  width: 1000px;
  height: 400px;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  box-shadow: 5px 5px 5px black;
  position: relative;
  flex-wrap: wrap;
  overflow: hidden;
  scrollbar-width: none;
  transition: center 2s ease-in;
  place-content: center;
  background-color: inherit;
}
.talks {
  border: orange solid;
  box-shadow: 15px 15px 15px black;
  padding: 30px;
  border-radius: 50px;
  position: absolute;
  background-color:  #4166D6;
  justify-content: space-between;
  transform: translate(-200px, -100px);
  transition: transform 0.5s ease, z-index 0s;
  width: 300px;
  height: 200px
}






#left_arrow_button {
  color: orange;
  position: absolute;
  margin-right: auto;
  right: 90%;


}
#right_arrow_button {
  color: orange;
  position: absolute;
  margin-left: auto;
  left: 90%;
}

#left_arrow_button, #right_arrow_button {
  position: absolute;
  z-index: 2;
}



#submitForm {
  border: orange solid;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-content: center;
  padding: 10px;

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