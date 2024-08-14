<script setup>
import { Transition, onMounted, onUpdated, ref } from "vue";
let currentUser = localStorage.getItem('user') || "Anon";
const talkTitle = ref("");
const talkSummary = ref("");
const error = ref(null);
let nextCommentId = 0;
const userList = ref(["All"]);
const userField = ref('');


function setUserName() {
  currentUser = userField.value;
  if (event.key == "Enter") {
    localStorage.setItem("user", currentUser)
  }
  userField.value = ""; 
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

const deleteTalk = (talkTitle) => {
  console.log("JSON title:", title)
  fetch('http://localhost:3000/talks/:title', {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({title: talkTitle})
  })
}



const postTalk = () => {
  console.log("input success:", talkTitle.value, talkSummary.value);
  fetch('http://localhost:3000/talks/', {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: talkTitle.value,
      summary: talkSummary.value,
      presenter: currentUser,
      comments: [],
      toggleTalk: false
    }) 
  });
  const repeatName = userList.value.find((user) => user == currentUser);
  if (!repeatName) {
    userList.value.push(currentUser);
  }
  talkTitle.value = "";
  talkSummary.value = "";
}

function fetchOK(url, options) {
  return fetch(url, options).then(response => {
    if (response.status < 400) return response;
    else throw new Error(response.statusText)
  })
}

const fetchTalks = async () => {
  try {
    let response = await fetch('http://localhost:3000/talks')
    let data = await response.json()
    // console.log("fetch talks data:", data)
    let startingTalks = JSON.parse(data.body)
    return startingTalks
  } catch (err) {
    
    console.log("Request failed: " + err);
    error.message = err
  }
  
}

const talks = ref([])

const pollTalks = async (update) => {
  let tag = undefined;
  for (;;) {
    let response;
    try {
      const options = tag ? {
        headers: {
          "If None-Match": tag,
          "Prefer": "wait=90"
        } 
      } : {};
      response = await fetchOK('http://localhost:3000/talks/longpoll', options)

    } catch (e) {
      console.log("Request failed: " + e);
      await new Promise(resolve => setTimeout(resolve, 500))
      continue;
    }
    if (response.status == 304) continue;
    tag = response.headers.get("ETag");
    update(await response.json())
  }
}
const updateTalks = (newTalks) => {

  talks.value = JSON.parse(newTalks.body)
  return talks.value
}




const TxtType = function(el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
}
TxtType.prototype.tick = function() {
  const i = this.loopNum % this.toRotate.length;
  // console.log("current loop iteration:", this.loopNum,"length of the string array:", this.toRotate.length, "remainder or index:", i)
  const fullTxt = this.toRotate[i];
  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1)
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1)
  }
  this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';
  let that = this;
  let delta = 200 - Math.random() * 100;

  if (this.isDeleting) { delta/= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta)
}
// window.onload = function() {
//   const elements = document.getElementsByClassName('typewrite');
//   for (let i = 0; i < elements.length; i++) {
//     let toRotate = elements[i].getAttribute('data-type');
//     let period = elements[i].getAttribute('data-period');
//     if (toRotate) {
//       new TxtType(elements[i], JSON.parse(toRotate), period)
//     }
//   }
// }

window.onload = async () => {
  try {
    let startingTalks = await fetchTalks();
    // console.log("on load starting talks:", startingTalks)
    talks.value = startingTalks
    // console.log("talks dot value:", talks.value)
  } catch (err) {
    error.value = err.message
  }
}

onMounted(() => {
  pollTalks(updateTalks)

  // console.log("on mounted updated talks:", updatedTalks)

  // // talks.value = updatedTalks
  // .catch(error => console.log("poll talks error:", error))
})










</script>

<template>
  
  <header class="titleContainer">
    <h1 id="title">Pete's Skill Sharing Website</h1>
    <h2>
    <a 
    href="" 
    class="typewrite" 
    data-period="2000"
    data-type='["Chat with your friends", "Search for your favorite topics", "Find your new community"]'>
    <span class="wrap"></span>
    </a>
    </h2>
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


  <Suspense>
  <div 
  class="talkContainer"
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
      <div v-if="talk.comments.length > 0">
      <div v-for="comment in talk.comments" :key="comment.id">
        <strong>{{ comment.presenter }}</strong> : {{ comment.message }}
      </div>
      </div>
      <div>
      <form @submit.prevent="addNewComment()" id="commentForm">
        <input v-model="talk.newComment">
        <button>Add comment</button>
      </form>
    </div>
  
      </p>
    
    </TransitionGroup>
  
  </div>
  </div>
</Suspense>



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

.typewrite {
  position: absolute;
  /* left: 100px; */
  text-decoration: none;
  font-size: 50px;
  color: orange !important;

}
.typewrite > .wrap {
  color: orange !important;
}

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
