<script setup>
import { ref, onMounted, nextTick, computed, watchEffect } from 'vue'
const currentSlide = ref(1)
// const slides = ref([])
let getSlideCount = ref(0)




const props = defineProps(
    {
    talkSlides: Array,
    navigation: Boolean,
    pagination: Boolean,
    startAutoPlay: Boolean,
    timeout: Number
})

const paginationEnabled = ref(props.pagination === undefined ? true : props.pagination);
const navEnabled = ref(props.navigation === undefined ? true : props.navigation);
const autoPlayEnabled = ref(props.startAutoPlay === undefined ? true : props.startAutoPlay);
const timeoutDuration = ref(props.timeout === undefined ? 5000 : props.timeout);






//next slide

const nextSlide = () => {

    if (currentSlide.value === getSlideCount.value) {

        currentSlide.value = 1;
        return;
    }
    currentSlide.value += 1
}

//prev slide

const prevSlide = () => {
    if (currentSlide.value === 1) {
        currentSlide.value = getSlideCount.value;
        return;
    }
    currentSlide.value -= 1;
}

const goToSlide = (index)  => {
    currentSlide.value = index + 1;
    
}

//autoplay

const autoPlay = () => {
    setInterval(() => {
        nextSlide()

    }, timeoutDuration.value)

}

if (autoPlayEnabled.value) {
    autoPlay();
}

watchEffect(() => {
//   console.log("carousel slides:", carouselSlides.value)
//   console.log("talks:", talks.value)
  if (props.talkSlides) {
        console.log("talk slides:", props.talkSlides)
        getSlideCount.value = props.talkSlides.length;
        console.log("getSlideCount on mounted:", getSlideCount)
    } 
})


</script>

<template>
    <div class="carousel">
        <slot :currentSlide="currentSlide"></slot>

        <!--Navigation-->
        <div class="navigate" v-if="navEnabled">
            <div class="toggle-page left">
                <i @click="prevSlide" class="fa-solid fa-chevron-left"></i>
            </div>
            <div class="toggle-page right">
                <i @click="nextSlide" class="fa-solid fa-chevron-right"></i>
            </div>
        </div>

        <!--Pagination-->
        <div class="pagination" v-if="paginationEnabled">
            <span
            @click="goToSlide(index)"
             v-for="(slide, index) in getSlideCount"
            :key="index"
            :class="{active : index + 1 === currentSlide}">

            
            </span>
        </div>



    </div>


</template>


<style scoped>
.navigate {
    padding: 0 16px;
    height: 100%;
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;

    .toggle-page {
        display: flex;
        flex: 1;
    }

    .right {
        justify-content: flex-end;
    }

    i {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        background-color: orange;
        color: blue;

    }



}

.pagination {
    position: absolute;
    bottom: 24px;
    width: 100%;
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;

    span {
        cursor: pointer;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: orange;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
    }

    .active {
        background-color: blue
    }

}







</style>