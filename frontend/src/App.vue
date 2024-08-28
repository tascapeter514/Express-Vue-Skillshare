<script setup>
import {  onMounted, defineAsyncComponent, ref, nextTick, watchEffect } from "vue";
import Typewriter from './components/Typewriter.vue'
import Carousel from './components/Carousel.vue';
import Slide from './components/Slide.vue';


let currentUser = localStorage.getItem('user') || "Anon";
const talks = ref()

const userList = ref(["All"]);
const userField = ref('');
const carouselSlides = ref()




const AsyncTalks = defineAsyncComponent(() => 
  import('/src/components/Talks.vue')
)

const CarouselTalk = defineAsyncComponent(() => 
  import('/src/components/CarouselTalk.vue')
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
  console.log("new talks:", newTalks)
  talks.value = newTalks;
  console.log("update talks and values:", talks.value)
  carouselSlides.value = newTalks
  return talks.value && carouselSlides.value
}

onMounted(() => {
  pollTalks(updateTalks);
})

watchEffect(() => {
  console.log("carousel slides:", carouselSlides.value)
  console.log("talks:", talks.value)
})









//when i click left, move slides to the left
//when i click right, move slides to the right
//when i click the nav indicators, move to that slide



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
        <Typewriter></Typewriter>
        
        <hr id ="titleRow">
      </div>
    </section>


<!-- 
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
</section> -->
<!-- <AsyncTalks 
      :talks="carouselSlides"
      :user="currentUser"
      :users="userList">
      </AsyncTalks> -->


<Carousel class="carousel" v-slot="{currentSlide}">
  <Slide v-for="(slide, index) in carouselSlides" :key="index">
    <div v-show="currentSlide === index + 1" class="slide-info">
      <CarouselTalk class="carouselTalk" :carouselTalk="slide" :carouselIndex="index"></CarouselTalk>




    </div>
  </Slide>
</Carousel>



</template>


<style scoped>
.carousel {
  position: relative;
  max-height: 50vh;
  height: 50vh;
  max-width: 50vh;
  width: 50vh;
  border: solid;
  margin: 0 auto;
}
.slide-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-height: 100%;
  height: 100%;
}
.carouselTalk {
  min-width: 100%;
  height: 100%;
  object-fit: cover;
}






header {
  border: thick;

  color: white;
  /* background-color: orange; */
  padding: 10px;
  /* background: orange; */

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
  color: orange;
}

nav a::before {
  content: '';
  display: block;
  height: 5px;
  width: calc(100% - 50px);
  width: 0;
  position: absolute;
  background-color: orange;
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
  color: orange;
}
nav a:hover::before {
  width: 100%;

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
