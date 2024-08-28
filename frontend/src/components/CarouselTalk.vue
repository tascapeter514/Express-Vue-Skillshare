<script setup>
import { onMounted, ref } from 'vue';


const props = defineProps({
    carouselTalk: Object,
    carouselIndex: Number,


})


</script>

<template>
<li class="carousel_slide">

    <div class="carousel_talk">
        <h2 > {{ carouselTalk.title }} {{ carouselIndex }}
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
.carousel_slide {
    list-style: none
}
</style>