<script setup>
import {  onMounted, defineAsyncComponent, ref } from "vue";
let currentUser = localStorage.getItem('user') || "Anon";
const error = ref(null);
const talks = ref([])
const userList = ref(["All"]);
const userField = ref('');
const postgresTalks = ref()


const AsyncTalks = defineAsyncComponent(() => 
  import('/src/components/Talks.vue')
)


function setUserName() {
  currentUser = userField.value;
  if (event.key == "Enter") {
    localStorage.setItem("user", currentUser)
  }
  userField.value = ""; 
}



const toggleUserTalks = (user) => {
  talks.value.forEach((talk) => { 
    talk.toggleTalk = user === "All" || talk.presenter === user;
  })
}


// postgres refactoring starts here
const postGresMessage = ref('')
const pgsqlSummary = ref('')
const pgsqlTitle = ref('')
const postgresFetch = async () => {
  try {
    let response = await fetch('/talks/database');
    let data = await response.json()
    console.log("postgres data:", data)

    postgresTalks.value = data

  } catch (err) {
    console.log("There was an error fetching: ", err);
    error.value = err.message;
  }
}




const addPostGresComment = async (postgresTitle) => {
  console.log("input success:", postGresMessage.value, postgresTitle )
  // try {
    fetch('/talks/database/comments', {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        author: currentUser,
        title: postgresTitle,
        message: postGresMessage.value

      })
    });
    postGresMessage.value = ""

  // } catch (err) {
  //   console.log("there was an error posting:", err);
  //   error.value = err.message;

  // }
}

const deletePGSQL = async (title) => {
  console.log("input success:", title);
  const encodedTitle = encodeURIComponent(title)
  fetch(`/talks/database/${encodedTitle}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    } 
  })
}

const postTalkToDatabase = async () => {
  fetch('/talks/database/addTalk', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      presenter: currentUser,
      summary: pgsqlSummary.value,
      title: pgsqlTitle.value,
      comments: []
    })
  })
  pgsqlSummary.value = '';
  pgsqlTitle.value = '';
}



function fetchOK(url, options) {
  return fetch(url, options).then(response => {
    if (response.status < 400) return response;
    else throw new Error(response.statusText)
  })
}

const fetchTalks = async () => {
  try {
    let response = await fetch('/talks')
    let data = await response.json()
    // console.log("fetch talks data:", data)
    let startingTalks = JSON.parse(data.body)
    return startingTalks
  } catch (err) {
    
    console.log("Request failed: " + err);
    error.message = err
  }
  
}

const pollTalks = async (update) => {
  let tag = undefined;
  for (;;) {
    let response;
    try {
      const options = tag ? {
        headers: {
          "If-None-Match": tag,
          "Prefer": "wait=90"
        } 
      } : {};
      response = await fetchOK('/talks/longpoll', options)
      console.log("response:", response)

    } catch (e) {
      console.log("Request failed: " + e);
      await new Promise(resolve => setTimeout(resolve, 500))
      continue;
    }
    if (response.status == 304) {
      console.log("304 response")
      continue
    };
    tag = response.headers.get("ETag");
    console.log(`Set tag to ${tag}`);
    console.log("talk JSON check")

    const talkJson = await response.json()
    // const testTalkResponse = await response.status()

    console.log("talk json:", talkJson)
    update(talkJson)
  }
}
const updateTalks = (newTalks) => {
  console.log("new talks to update dom:", newTalks)

  talks.value = newTalks
  console.log("value talks:", talks.value)
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
const typeWriterEffect = function() {
  const elements = document.getElementsByClassName('typewrite');
  for (let i = 0; i < elements.length; i++) {
    let toRotate = elements[i].getAttribute('data-type');
    let period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period)
    }
  }
}

const fetchStartingTalks = async () => {
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
  // fetchStartingTalks()
  postgresFetch()
  pollTalks(updateTalks)
  // typeWriterEffect()


})



</script>

<template>
<div class="postgresContainer">
  <div v-for="postgresTalk in postgresTalks" :key="postgresTalk.title">
    <p class="talksPostGres" v-if="postgresTalks.length > 0">
      <h2>{{ postgresTalk.title }}
        <button @click="deletePGSQL(postgresTalk.title)">Remove</button>
      
      </h2>
      <div>
        by <strong>{{ postgresTalk.presenter }}</strong>
        <p>{{ postgresTalk.summary }}</p>
      </div>
      <div>
        <div v-for="postgresComment in postgresTalk.comments" :key="postgresComment.presenter">
          <strong> {{ postgresComment.presenter }}</strong> : {{ postgresComment.post }}
        </div>
      </div>
      <div>
        <form @submit.prevent="addPostGresComment(postgresTalk.title)">
          <input v-model="postGresMessage">
          <button>Add Comment</button>
        </form>
      </div>
    </p>
  </div>
</div>

<div class="postgresSubmit">
  <h3>Submit a Talk</h3>
  <form @submit.prevent="postTalkToDatabase">
    <div>
      <label for="postgresTitle">Title:</label>
      <input id="postgresTitle" v-model="pgsqlTitle">
    </div>
    <div>
      <label for="postgresSummary"></label>
      Summary: <input id="postgresSummary" v-model="pgsqlSummary">
    </div>
    <button>Submit</button> 
  </form>
</div>
  
  
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


<AsyncTalks 
  :talks="talks"
  :user="currentUser"
  :users="userList">
</AsyncTalks>




</template>


<style scoped>
.postgresContainer {
  display: flex;
  position: absolute;
  border: solid;
  color: orange;
  width: 400px;
  height: 400px;
  left: 1500px;
  overflow: auto;
  flex-wrap: wrap;
}
.talksPostGres {
  border: orange solid;
  box-shadow: 15px 15px 15px black;
  margin: 15px;
  padding: 15px;
  border-radius: 50px
}
.postgresSubmit {
  border: orange solid;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-content: center;
  padding: 10px;
  top: 600px;
  position: relative;
  width: 600px;
  left: 1100px;
  box-shadow: 15px 15px 15px black;
}

.postgresSubmit label {
  display: block;
}
.postgresSubmit input {
  width: 30em;
}
.postgresSubmit h3 {
  margin-bottom: 0.33em;
}
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


.userNamesContainer {
  display: flex;
  border: orange solid;
  width: 1000px;
  height: 100px;
  justify-content: center;
  align-content: center;
  position: relative;
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
