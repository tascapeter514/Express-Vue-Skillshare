<script setup>
import TalkCard from './TalkCard.vue'
import { ref, computed, watchEffect } from 'vue';

const props = defineProps({
    carouselTalks: Array,
    carouselUser: String,
})



// watchEffect(() => {
//   console.log("carousel talks:", props.carouselTalks)



// })

// console.log('carousel talks global:', props.carouselTalks)

const filtersVisible = ref(false);
const query = ref('');
const searchQuery = ref('');

const filteredTalks = computed(() => {
    if (props.carouselTalks) {
        console.log("prop talks:", props.carouselTalks)
        let carouselTalks = props.carouselTalks;
        console.log("query value:", query.value)
        const filteredTalks = carouselTalks.filter(carouselTalk => JSON.stringify(carouselTalk).includes(query.value))
        if (query.value == 'comments') {
            console.log("commment check")
            console.log("comment carousel filtered talks:", filteredTalks)
            const talksWithComments = filteredTalks.filter((filteredTalk) => {
                console.log("carousel talk in filter:", filteredTalk.title);
                console.log("carousel filtered comments:", filteredTalk.comments.length)
                return filteredTalk.comments.length > 1
            });
            console.log("talks with comments:", talksWithComments)

            return talksWithComments
        } else if (searchQuery.value) {
            return filteredTalks.filter(talk => JSON.stringify(talk).toLowerCase().includes(searchQuery.value.toLowerCase()))
        }
        return query.value ? filteredTalks : carouselTalks
        
    }
})

</script>

<template>
    <main>
        <header>
            <div class="header-flex">
                <h1>Talk Grid</h1>
                <button @click="filtersVisible = !filtersVisible">
                    {{ filtersVisible ? 'Hide Filters' : 'Show Filters' }}
                </button>
            </div>

            <Transition>
                <div v-show="filtersVisible" class="headers-filters">
                    <input type="search" v-model="searchQuery" placeholder="Search Talks">
                    <div class="button-group">
                        <button @click="query = ''" :class=" { active: query === ''}">Clear Filters</button>
                        <!-- <button @click="query = 'carouselUser'" :class="{ active: query === 'carouselUser'}">Presenter</button> -->
                        <button
                             @click="query = 'comments'"
                            :class="{ active: query === 'comments' }">
                            Comments
                        </button>
                        <!-- <button>Title</button> -->
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
                :carouselUser="carouselUser"
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