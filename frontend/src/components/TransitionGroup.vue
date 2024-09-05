<script setup>
import Talk from './Talk.vue'
import SubmitForm from './SubmitForm.vue'
import UserForm from './UserForm.vue'
import FilterButtons from './FilterButtons.vue'
import HeaderButtons from './HeaderButtons.vue'
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
    currentUser.value = userInput;
}

function handleFilteredTalks(newTalks) {
    filteredTalks.value = newTalks
}


function handleHeaderUpdates(updatedHeaders) {
    const [updatedFilters, updatedTalkForm, updatedCurrentUser] = updatedHeaders;
    filtersVisible.value = updatedFilters;
    talkFormVisible.value = updatedTalkForm;
    currentUserVisible.value = updatedCurrentUser

}
</script>

<template>
    
    <main>
        <header>
            <!-- HEADER BUTTONS COMPONENT -->
            <HeaderButtons 
                :currentUserVisible="currentUserVisible" 
                :talkFormVisible="talkFormVisible"
                :filtersVisible="filtersVisible"
                @header-updates="(updatedHeaders) => handleHeaderUpdates(updatedHeaders)"
                >
            </HeaderButtons>


            <!-- CURRENT USER COMPONENT -->

            <Transition>
                <UserForm
                    @set-user-name="(userInput) => setCurrentUser(userInput)"
                    :currentUserVisible="currentUserVisible" 
                    :currentUser="currentUser">
                </UserForm>
            </Transition>

            <!-- SUBMIT FORM COMPONENT -->
            

            <Transition>
                <SubmitForm :talks="talks" :talkFormVisible="talkFormVisible" :currentUser="currentUser"></SubmitForm>
            </Transition>

            <!-- FILTER BUTTONS COMPONENT -->


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