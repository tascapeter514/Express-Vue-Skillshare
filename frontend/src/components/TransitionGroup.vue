<script setup>
import Talk from './Talk.vue'
import SubmitForm from './SubmitForm.vue'
import UserForm from './UserForm.vue'
import { ref, computed, watchEffect } from 'vue';

const props = defineProps({
    talks: Array
})

//CURRENT USER AND USER INPUT VARIABLES
let currentUser = ref(localStorage.getItem('user') || "Anon");




//filter and query references
const filtersVisible = ref(false);
const currentUserVisible = ref(false);
const talkFormVisible = ref(false);
const query = ref('');
const searchQuery = ref('');



//FILTER FUNCTION
//debug and remove logs and make improvements
const filteredTalks = computed(() => {
    if (props.talks) {
        let talks = props.talks;
        console.log("current user and query value:", currentUser.value, query.value)
        const filteredTalks = talks.filter(talk => JSON.stringify(talk).includes(query.value))
        console.log("filtered talks before any condition:", filteredTalks)
        if (query.value == 'comments') {
            const talksWithComments = talks.filter((filteredTalk) => {return filteredTalk.comments.length > 0;});
            return talksWithComments;
        } else if (query.value == 'mostRecent') {
            const mostRecentTalks = talks.slice().sort((talkA, talkB) => {
                return new Date(talkB.timestamp) - new Date(talkA.timestamp)
            });
            return mostRecentTalks
        } else if (query.value == 'currentUser') {
            console.log("current user filter check")
            console.log("current user filter value:", currentUser.value)
            console.log("current filtered talks:", filteredTalks)
            const currentUserTalks = talks.filter(talk => {
                console.log("presenter:", talk.presenter, "currentUser:", currentUser.value);
                return talk.presenter === currentUser.value;
            })



            return currentUserTalks;
        } else if (searchQuery.value) {
            return filteredTalks.filter(talk => JSON.stringify(talk).toLowerCase().includes(searchQuery.value.toLowerCase()))
        }
        return query.value ? filteredTalks : talks;
    }
})



const setCurrentUser = (userInput) => {
    console.log("set current user:", userInput)
    currentUser.value = userInput;
}

watchEffect(() => {
    console.log("watch effect currentUser:", currentUser)
})


</script>

<template>
    <!-- CREATE HEADER BUTTONS COMPONENT -->
    <main>
        <header>
            <div class="header-flex">
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

            <!-- CURRENT USER BUTTON COMPONENT -->

            <Transition>
                <UserForm @set-user-name="(userInput) => setCurrentUser(userInput)" :currentUserVisible="currentUserVisible" :currentUser="currentUser"></UserForm>
                
            </Transition>

            <!-- SUBMIT FORM COMPONENT -->
            

            <Transition>
                <SubmitForm :talks="talks" :talkFormVisible="talkFormVisible" :currentUser="currentUser"></SubmitForm>
            </Transition>

            <!-- FILTER BUTTONS COMPONENT -->

            <Transition>
                <div v-show="filtersVisible" class="headers-filters">
                    <input type="search" v-model="searchQuery" placeholder="Search Talks">
                    <div class="button-group">
                        <button @click="query = ''" :class=" { active: query === ''}">Clear Filters</button>
                        <button @click="query = 'currentUser'" :class="{active: query == 'currentUser'}">Current User</button>
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
                <Talk
                v-for="(talk, index) of filteredTalks"
                class="talkCard"
                :key="index"
                :talk="talk"
                :index="index"
                :currentUser="currentUser"
                ></Talk>
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
    justify-content: right;

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