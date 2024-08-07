<script setup>
import { Transition, onMounted, ref } from "vue";
let currentUser = localStorage.getItem('user') || "Anon";
const talkTitle = ref("");
const talkSummary = ref("");
const error = ref(null);
const data = ref(null);

const startingTalks = [
  
]


const talks = ref(startingTalks);
let nextCommentId = 0;
let nextTalkId = 0;
const userList = ref(["All"]);
const userField = ref('');


function setUserName() {
  currentUser = userField.value;
  if (event.key == "Enter") {
    localStorage.setItem("user", currentUser)
  }
  userField.value = ""; 
}

function addNewTalk() {
  const talkData = {
    id: nextTalkId++,
    toggleTalk: true,
    presenter: currentUser,
    title: talkTitle.value,
    summary: talkSummary.value,
    comments: [],
    newComment: ""
  }
  talks.value.push(talkData)
  const repeatName = userList.value.find((user) => user == talkData.presenter);
  if (!repeatName) {
    userList.value.push(talkData.presenter);
  }
  talkTitle.value = "";
  talkSummary.value = "";
}
  

function addNewComment(talkId) {
  const currentTalk = talks.value.find(talk => talk.id === talkId)
  const commentData = {
    id: nextCommentId++,
    presenter: currentUser,
    message: currentTalk.newComment
  }

  if (currentTalk) {
    currentTalk.comments.push(commentData);
  }

  currentTalk.newComment = "";
}

const toggleUserTalks = (user) => {
  talks.value.forEach((talk) => { 
    talk.toggleTalk = user === "All" || talk.presenter === user;
  })
}

const removeTalk = (id) => {
  const talkToDelete = talks.value.find((talk) => talk.id == id);
  talks.value = talks.value.filter((talk) => talk != talkToDelete);
}


// fetch('/message')
// .then((res) => res.text())
// .then((text) => data.value = text)
// .catch((err) => error.value = err)

// const fetchData = async() => {
//   try {
//     const response = await fetch('http://localhost:3000/message')
//     if (!response.ok) {
//       throw new Error("Error encountered")
//     }
//     data.value = await response.text()
//   }
//   catch (error) {
//     console.log("There's been some sort of error:", error)
//   }
// }

// onMounted(() => {
//   fetchData();
// })




const postMessage = () => {
  console.log("input success:", talkTitle.value, talkSummary.value);
  fetch('http://localhost:3000/talk', {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: talkTitle.value,
      summary: talkSummary.value
    }) 
  })
  talkTitle.value = "";
  talkSummary.value = "";
}

fetch('http://localhost:3000/talk')
.then((res) => res.json())
.then((json) => data.value = json)
.catch((err) => error.message = err)

</script>

<template>
  <header class="titleContainer">
    <h1 id="title">Pete's Skill Sharing Website</h1>
    <hr id ="titleRow">
  </header>

<div class="userNamesContainer">
  <header>
    <h2>The current user is {{ currentUser }}</h2>
  </header>
  <div class="inputField">
    <label for="userField">Your name: </label>
    <input id="userField" v-model="userField" @keydown.enter="setUserName" />
  </div>
</div>


<div 
class="userRadioButtons"
@mouseover="test">
    <label for="users">Usernames:  </label>

    <td v-for="(user, index) in userList" :key="index"> 
      {{ user }}
      <input
        type="radio"
        id="index"
        :value="currentUser"
        name="users"
        @change="toggleUserTalks(user)"
      >
    </td>
  </div>


  <div 
  class="talkContainer"
  >
    <div v-for="talk in talks" :key="talk.id">
      <TransitionGroup name="talkList" tag="p">
      <p v-if="talk.toggleTalk"
       class="talks">
        <h2 > {{ talk.title }}
          <button @click="removeTalk(talk.id)">Remove</button>
        </h2>
        <div>
          by <strong>{{ talk.presenter }}</strong>
          <p> {{ talk.summary }}</p>
        </div>
      <div v-if="talk.comments.length > 0">
      <div v-for="comment in talk.comments" :key="comment.id">
        <strong>{{ comment.presenter }}</strong> : {{ comment.message }}
      </div>
      </div>
      <div>
      <form @submit.prevent="addNewComment(talk.id)" id="commentForm">
        <input v-model="talk.newComment">
        <button>Add comment</button>
      </form>
    </div>
      </p>
    </TransitionGroup>
  </div>

  </div>


  <div id="submitForm">
    <form @submit.prevent="postMessage">
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

<div class="dataContainer">
  <div v-if="data"> Data Loaded:
    <pre> {{ data }}</pre>
  </div>
  <div v-else-if="error"> {{ error.message }}</div>
  <div v-else> Loading </div>
</div>

<!-- <div class="postContainer">
<form 
@submit.prevent="postMessage"
method="PUT">
  <input v-model="inputMessage">
  <button
  type="submit" 
  class="talkButton"
  >Post Message</button>
</form>
</div> -->


 

 

</template>

<style scoped>


.postContainer {
  position: absolute;
  border: orange solid;
  width: 200px;
  left: 1250px;
  bottom: 400px

}


.userNamesContainer {
  display: flex;
  border: orange solid;
  width: 1000px;
  height: 100px;
  justify-content: center;
  align-content: center;
  position: relative;
  top: 40px;
  left: 20px;
  border-radius: 50px;
  box-shadow: 15px 15px 15px black;
}
.userRadioButtons {
  border: solid orange;
  border-radius: 15px;
  box-shadow: 15px 15px 15px black;
  width: 300px;
  height: 50px;
  position: absolute;
  top: 200px;
  left: 100px;
  display: flex;
  text-wrap: wrap;
  text-align: right;
  overflow: auto;
  transition: 
    width 2s,
    height 2s,
    delay 3s
}
.dataContainer {
  border: solid orange;
}
.userRadioButtons:hover {
  width: 400px;
  height: 100px
}

.userRadioButtons label {
  padding: 2px;
}
.userRadioButtons input {
  background-color: orange;

}
.userRadioButtons td {
  display: flex;
  align-items: center
}

.talkContainer {
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
.dataContainer {
  position: relative;
  display: grid;
  left: 1200px;
  bottom: 300px;
  width: 300px;
  height: 150px;
  border: solid orange 2px;
  justify-content: center;
  align-items: center;
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







</style>
