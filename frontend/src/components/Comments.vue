<script setup>


defineProps({
    headingColor: Object
})

const emit = defineEmits(['changeColor'])

function handleColorChange() {
    emit('changeColor', { color: 'red'})
}





</script>
<template>
    <div class="commentContainer"  >
        <h1 :style="headingColor">O Brave New World that has such people in it!</h1>
        <button 
        :style="headingColor"
        @click="handleColorChange"
        >Change my color</button>

    </div>
    



</template>
<style scoped>





</style>