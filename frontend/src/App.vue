<script setup>
import {  onMounted, defineAsyncComponent, ref, nextTick, watchEffect } from "vue";
import Typewriter from './components/Typewriter.vue'
import TransitionGroup1 from './components/TransitionGroup.vue'






const carouselSlides = ref()






const CarouselTalk = defineAsyncComponent(() => 
  import('/src/components/CarouselTalk.vue')
)





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

  carouselSlides.value = newTalks
  return carouselSlides.value
}

onMounted(() => {
  pollTalks(updateTalks);
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

  <main>
    <TransitionGroup1 :carouselTalks="carouselSlides">

    </TransitionGroup1>
  </main>

      









</template>


<style scoped>








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
