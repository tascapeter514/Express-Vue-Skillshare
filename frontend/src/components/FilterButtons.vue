<script setup>

import { ref, computed, watch } from 'vue'


const props = defineProps({
    talks: Array,
    filtersVisible: Boolean,
    currentUser: String,
})

const query = ref('');
const searchQuery = ref('');

const emit = defineEmits(['filterUpdates'])



//FILTER FUNCTION
//debug and remove logs and make improvements
const filteredTalks = computed(() => {
    if (props.talks) {
        let talks = props.talks;
        console.log("current user in computed:", props.currentUser)
        let currentUser = props.currentUser;
        console.log("current user and query value:", currentUser, query.value)
        // const filteredTalks = talks.filter(talk => JSON.stringify(talk).includes(query.value))
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
            console.log("current user filter value:", currentUser)
            console.log("current filtered talks:", filteredTalks)
            const currentUserTalks = talks.filter(talk => {
                console.log("presenter:", talk.presenter, "currentUser:", currentUser);
                return talk.presenter === currentUser;
            })
            return currentUserTalks;
        } else if (searchQuery.value) {
            return filteredTalks.filter(talk => JSON.stringify(talk).toLowerCase().includes(searchQuery.value.toLowerCase()))
        }
        return query.value ? filteredTalks : talks;
    }
})

watch(filteredTalks, (filteredTalks) => {
    console.log("filtered talks:", filteredTalks)

    emit('filterUpdates', filteredTalks)


})


</script>

<template>

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

</template>

<style scoped>
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

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px;
}

button.active {
    background-color: blue;
    color: white;
}
</style>