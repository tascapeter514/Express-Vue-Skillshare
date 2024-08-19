<script setup>
import {  onMounted, defineAsyncComponent, ref } from "vue";
let currentUser = localStorage.getItem('user') || "Anon";
const error = ref(null);
const talks = ref([])
const userList = ref(["All"]);
const userField = ref('');

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
          "Prefer": "wait=5"
        } 
      } : {};
      response = await fetchOK('/talks/longpoll', options)

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
    const talkJson = await response.json()
    console.log(talkJson)
    update(talkJson)
  }
}
const updateTalks = (newTalks) => {

  talks.value = newTalks
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
  pollTalks(updateTalks)
  // typeWriterEffect()


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


<AsyncTalks 
  :talks="talks"
  :user="currentUser"
  :users="userList">
</AsyncTalks>




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
