<script setup>
import Talk from './Talk.vue'
import SubmitForm from './SubmitForm.vue'
import UserForm from './UserForm.vue'
import FilterButtons from './FilterButtons.vue'
import { ref, computed, watchEffect } from 'vue';

const props = defineProps({
    talks: Array
})

//CURRENT USER AND USER INPUT VARIABLES
let currentUser = ref(localStorage.getItem('user') || "Anon");
const filteredTalks = ref([])


//filter and query references
const currentUserVisible = ref(false);
const talkFormVisible = ref(false);
const filtersVisible = ref(false);

const setCurrentUser = (userInput) => {
    console.log("set current user:", userInput)
    currentUser.value = userInput;
}


//USE TO EMIT AN EVENT WHEN THE FILTERED TALKS CHANGE
watchEffect(() => {
    console.log("watch effect currentUser:", currentUser)
})

function handleFilteredTalks(newTalks) {
    console.log("new filtered talks:", newTalks);
    filteredTalks.value = newTalks
}

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
            <!-- CREATE FILTER BUTTONS COMPONENT AND EMIT AND EVENT WHEN FILTER TALKS VALUE CHANGES -->

            <Transition>
                <FilterButtons 
                :talks="talks" 
                :filtersVisible="filtersVisible" 
                @filter-updates="(newTalks) => handleFilteredTalks(newTalks)"
                :currentUser="currentUser"
                ></FilterButtons>
                
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