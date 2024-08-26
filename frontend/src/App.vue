<script setup>
import {  onMounted, defineAsyncComponent, ref } from "vue";
let currentUser = localStorage.getItem('user') || "Anon";
const talks = ref()
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

//refactor to VUE
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





onMounted(() => {

  pollTalks(updateTalks)
  // typeWriterEffect()
  


})



</script>

<template>
  <header>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Talks</a></li>
      </ul>
      </nav>
  </header>
  <section>
      <div class="titleContainer">
        <h1 id="title">Pete's Skill Sharing Website</h1>
        
        <hr id ="titleRow">
      </div>
    </section>
  


<div class="userNamesContainer">
    <h2>The current user is {{ currentUser }}</h2>
  <div class="inputField">
    <label for="userField">Your name: </label>
    <input id="userField" v-model="userField" @keydown.enter="setUserName" />
  </div>
</div>

<section>
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
</section>
<article>
<AsyncTalks 
  :talks="talks"
  :user="currentUser"
  :users="userList">
</AsyncTalks></article>





</template>


<style scoped>
header {

  color: white;
  /* background-color: orange; */
  padding: 10px;
  background: orange;

}

header::after {
  content: '';
  display: table;
  clear: both;
  
}

nav {
  float: right;
  
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  /* border: solid; */
  padding-right: 50px
}
nav li {
  padding-top: 25px;
  display: inline-block;
  margin-left: 150px;
  position: relative;
}
nav li:hover {
  color: blue
}

nav a::before {
  content: '';
  display: block;
  height: 5px;
  width: calc(100% - 50px);
  width: 0;
  position: absolute;
  background-color: blue;
  top: 0;
  left: 0;
  transition: all ease-in-out 250ms;
}

nav li:hover a::before {
  width: 100%;
}

nav a {
  text-decoration: none;
  color: white;
  text-transform: uppercase;
  font-size: 14px;

}
nav a:hover {
  color: blue
}
nav a:hover::before {
  width: 100%;

}
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
