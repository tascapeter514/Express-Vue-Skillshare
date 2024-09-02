<script setup>
import TalkCard from './TalkCard.vue'
import { ref, computed, watchEffect } from 'vue';

const props = defineProps({
    carouselTalks: Array
})

//current user and user input variables
let currentUser = localStorage.getItem('user') || "Anon";
const userField = ref('')

function setUserName() {
    currentUser = userField.value;
    if (event.key == "Enter") {
        localStorage.setItem("user", currentUser)
    }
    userField.value = "";
}



//filter and query references
const filtersVisible = ref(false);
const currentUserVisible = ref(false);
const talkFormVisible = ref(false);
const query = ref('');
const searchQuery = ref('');

//talk form input variables
const talkTitle = ref('');
const talkSummary = ref('');


//debug and remove logs and make improvements
const filteredTalks = computed(() => {
    if (props.carouselTalks) {
        let carouselTalks = props.carouselTalks;
        const filteredTalks = carouselTalks.filter(carouselTalk => JSON.stringify(carouselTalk).includes(query.value))
        if (query.value == 'comments') {
            const talksWithComments = filteredTalks.filter((filteredTalk) => {return filteredTalk.comments.length > 0;});
            return talksWithComments;
        } else if (query.value == 'mostRecent') {
            const mostRecentTalks = carouselTalks.slice().sort((talkA, talkB) => {
                return new Date(talkB.timestamp) - new Date(talkA.timestamp)
            });
            return mostRecentTalks
        } else if (query.value == currentUser) {
            const currentUserTalks = carouselTalks.filter(carouselTalk => carouselTalk.presenter === currentUser)
            return currentUserTalks;
        } else if (searchQuery.value) {
            return filteredTalks.filter(talk => JSON.stringify(talk).toLowerCase().includes(searchQuery.value.toLowerCase()))
        }
        return query.value ? filteredTalks : carouselTalks;
    }
})


//Add time stamp?
//fix bugs with repeatName. Build user repository? 
const postTalk = () => {
//   console.log("input success:", talkTitle.value, talkSummary.value);
const checkForRepeatTitle = props.carouselTalks.some((carouselTalk) => carouselTalk.title == talkTitle.value)
// console.log("repeat talk:", checkForRepeatTitle)
    if (checkForRepeatTitle) {
        alert("There is already a talk with this title. Please enter another title for your talk.")
    } else {
        fetch('/talks/addTalk', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: talkTitle.value,
                summary: talkSummary.value,
                presenter: currentUser,
                timeStamp: new Date(),
                comments: [],
            })
        })
    }
talkTitle.value = "";
talkSummary.value = "";
}



</script>

<template>
    <main>
        <header>
            <div class="header-flex">
                <h1>Talk Grid</h1>
                    <div class="header-flex_buttons">
                        <button @click="filtersVisible = !filtersVisible" :class="{ active: filtersVisible }">
                            {{ filtersVisible ? 'Hide Filters' : 'Show Filters' }}
                        </button>
                        <button @click="currentUserVisible = !currentUserVisible" :class="{ active: currentUserVisible }">
                            {{ currentUserVisible ? 'Hide Current User' : 'Show Current User' }}
                        </button>
                        <button @click="talkFormVisible = !talkFormVisible" :class=" { active: talkFormVisible }">
                            {{ talkFormVisible ? 'Hide Submit Form' : 'Show Submit Form' }}
                        </button>
                    </div>
            </div>

            <Transition>
                <div class="currentUserForm" v-show="currentUserVisible">
                    <h2>The current user is {{ currentUser }} </h2>
                    <div class="inputField">
                        <label for="userField">Your name: </label>
                        <input id="userField" v-model="userField" @keydown.enter="setUserName">
                    </div>
                </div>
            </Transition>
            

            <Transition>
                <div class="talkSubmitForm" v-show="talkFormVisible">
                    <form @submit.prevent="postTalk">
                        <h3>Submit a Talk</h3>
                        <label for="title">Title: </label>
                        <input v-model="talkTitle">
                        <label for="summary">Summary: </label>
                        <input v-model="talkSummary">
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </Transition>

            <Transition>
                <div v-show="filtersVisible" class="headers-filters">
                    <input type="search" v-model="searchQuery" placeholder="Search Talks">
                    <div class="button-group">
                        <button @click="query = ''" :class=" { active: query === ''}">Clear Filters</button>
                        <button @click="query = currentUser" :class="{active: query == currentUser}">Current User</button>
                        <button @click="query = 'mostRecent'" :class="{active: query == 'mostRecent'}">Most Recent</button>
                        <button
                             @click="query = 'comments'"
                            :class="{ active: query === 'comments' }">
                            Comments
                        </button>
                    </div>
                </div>
            </Transition>
        </header>


        <div class="talk-grid">
            <TransitionGroup name="list">
                <TalkCard
                v-for="(carouselTalk, index) of filteredTalks"
                class="talkCard"
                :key="index"
                :carouselTalk="carouselTalk"
                :carouselIndex="index"
                :carouselUser="currentUser"
                ></TalkCard>
            </TransitionGroup>
        </div>
    </main>

</template>

<style scoped>

main {
    text-align: center;
    max-width: 1100px;
    align-items: center;
    margin: 0 auto;
    position: relative;
}

.talkSubmitForm {
    border: orange solid;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 100%;
    height: 100%;
    box-shadow: 15px 15px 15px black;
    position: relative;
}
.currentUserForm {
    border: orange solid;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 100%;
    height: 100%;
    box-shadow: 15px 15px 15px black;
    position: relative;
}

header {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.header-flex {
    display: flex;
    align-items: center;  
    justify-content: space-between;
}
.header-flex_buttons {
    display: flex;

}


.header-flex_buttons button.active {
    background-color: blue;
    color: white;
} 
.headers-filters {
    border: orange solid;
    border-radius: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    width: 100%;
    height: 100%;
    box-shadow: 15px 15px 15px black;
    position: relative;

}


.headers-filters input {
    height: 50px;
    border: 1px solid rgba(2, 28, 62, .1);
    font-size: 1rem;
    padding: 0 1rem;

}

.button-group {
    display: -webkit-box;
    max-width: 100%;
    overflow: auto;
}

button {
  font-size: 1rem;
  height: 40px;
  display: grid;
  place-items: center;
  margin-right: 0.4rem;
  background-color: orange;
  margin-top: 10px;
  border-radius: 30px;
  font-weight: 600;
  color: black;
  border: 1px solid orange;
  padding: 0 1rem;
  cursor: pointer;
  transition: 0.3s;
}

button.active {
    background-color: blue;
    color: white;
}

h1 {
    font-weight: 700;
}

.talk-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;

}

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px;
}

/* Transition Class Names - Default */
.v-move,
.v-enter-active,
.v-leave-active {
    transition: 0.3s ease;
}
.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateY(10px)
}

/* Transition Group Class Names - List */



.list-move,
.list-enter-active,
.list-leave-active {
    transition: 0.3s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(10px)

}

/* Adding some styles to the exit transition class can make the animation smoother */

.list-leave-active {
    position: absolute;
    right: 0;
    left: 0;
}


</style>