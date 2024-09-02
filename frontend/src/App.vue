<script setup>
import {  onMounted, ref} from "vue";
import Typewriter from './components/Typewriter.vue'
import TransitionGroup1 from './components/TransitionGroup.vue'
import NavBar from './components/NavBar.vue'

const talks = ref()


//CHECK FETCH STATUS HELPER FUNCTION
function fetchOK(url, options) {
  return fetch(url, options).then(response => {
    if (response.status < 400) return response;
    else throw new Error(response.statusText)
  })
}


//LONG POLLING FETCH
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
  console.log("incoming talks:", newTalks)
  talks.value = newTalks
  return talks.value
}

onMounted(() => {
  console.log("talk order pre longpoll:", talks.value)
  pollTalks(updateTalks);
  console.log("talk order post longpoll:", talks.value)
})


</script>

<template>

  <header>
    <NavBar></NavBar>
  </header>

  <section>
      <div class="titleContainer">
        <h1 id="title">Pete's Skill Sharing Website</h1>
        <Typewriter></Typewriter>
        <hr id ="titleRow">
      </div>
    </section>

  <main>
    <TransitionGroup1 :talks="talks">
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
