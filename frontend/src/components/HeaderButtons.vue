<script setup>
import { watch, ref } from 'vue';


const emit = defineEmits(['headerUpdates'])



const props = defineProps({
    filtersVisible: Boolean,
    talkFormVisible: Boolean,
    currentUserVisible: Boolean,
})

const filtersVisible = ref(props.filtersVisible);
const talkFormVisible = ref(props.talkFormVisible);
const currentUserVisible = ref(props.currentUserVisible)



watch([filtersVisible, talkFormVisible, currentUserVisible], ([filtersVisible, talkFormVisible, currentUserVisible]) => {
    emit('headerUpdates', [filtersVisible,talkFormVisible, currentUserVisible])

})

</script>

<template>

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

</template>

<style scoped>

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

input {
  background-color: rgb(241, 214, 178);
  padding: 5px;
  color: black;
  border-radius: 15px;
}

</style>