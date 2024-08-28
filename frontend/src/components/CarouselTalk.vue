<script setup>

const props = defineProps({
    carouselTalks: Array,


})



</script>

<template>
<li class="carousel_slide" v-for="(carouselTalk, index) in carouselTalks" 
    :key="index">

    <div class="carousel_talk">
        <h2 > {{ carouselTalk.title }} {{ index }}
                <button @click="deleteTalk(talk.title)">Remove</button>
        </h2>
        <div>
            by <strong>{{ carouselTalk.presenter }}</strong>
            <p> {{ carouselTalk.summary }}</p>
        </div>
    </div>
</li>



</template>



<style scoped>
.carousel_talk {
    width: 100%;
    height: 100%;
    object-fit: cover;


}

.carousel_slide {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
}


</style>